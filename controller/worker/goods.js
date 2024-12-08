const Good = require("../../model/Good")
const fs = require("fs")
const path = require("path");
const User = require("../../model/User");
exports.index = async (req, res) => {
	try {
		// Destructure query parameters with default values
		let { currentPage = 0, limit = 10, sort, eq, plu } = req.query;
		// console.log(eq);
		// console.log(plu);

		currentPage = parseInt(currentPage);
		limit = parseInt(limit);

		// Base query for filtering archived status and role
		let query = { adminId: req.user.adminId, $or: [], };

		if (plu) {
			query.plu = { $eq: plu };
		}
		// Apply equality filters using RegEx (case-insensitive)
		if (eq) {
			eq.forEach(filter => {
				const [field, value] = filter.split('.');
				if (field && value) {
					query.$or.push({ [field]: { $regex: value, $options: 'i' } }); // Push each condition into $or array
				}
			});
		}
		// If $or array is empty, remove it from the query to avoid unnecessary empty condition
		if (query.$or.length === 0) {
			delete query.$or;
		}
		// Define sorting options if provided
		let sortOptions = {};
		if (sort) {
			const [sortField, sortOrder] = sort.split('.');
			sortOptions[sortField] = sortOrder === "ABC" ? 1 : -1; // 1 for Aending, -1 for descending
		}

		// Query the database for paginated, filtered, and sorted results
		const [users, userLength] = await Promise.all([
			Good.find(query, "barcode title realPrice wholesale_price count weight goodType plu archived")
				.skip(limit * currentPage)
				.limit(limit)
				.sort(sortOptions),
			Good.countDocuments(query)
		]);
		// Send response
		res.json({
			status: true,
			message: "All Goods",
			options: {
				userLength,
				currentPage,
				limit,
			},
			users
		});
	} catch (err) {
		res.status(500).json({
			status: false,
			message: "Error retrieving admins",
			error: err.message
		});
	}
}
exports.barcode = async (req, res) => {
	try {
		let good = await Good.findOne({ barcode: req.params.barcode, adminId: req.user.adminId });
		if (!good) {
			res.json({
				status: false,
				message: "Barcode not exist",
			})
		} else {
			res.json({
				status: true,
				message: "Barcode exist",
				good
			})
		}
	} catch (error) {
		res.status(500).json({
			status: true,
			message: "Dasturchi bilan bo`g`laning",
		})
	}
}
exports.plu = async (req, res) => {
	try {
		const [goods, goodsLength] = await Promise.all([
			Good.aggregate([
				{ $match: { goodType: "kg", adminId: req.user.adminId } },
				{
					$project: {
						title: 1,
						price: "$wholesale_price", // Rename wholesalePrice to price
						plu: 1
					}
				}
			]),
			Good.countDocuments({ goodType: "kg" }) // Count only documents with goodType "kg"
		]);
		// Send response
		res.json({
			status: true,
			message: "All Goods only plu",
			options: {
				goodsLength,
			},
			goods
		});
	} catch (err) {
		res.status(500).json({
			status: false,
			message: "Error retrieving admins",
			error: err.message
		});
	}
}
exports.quicGood = async (req, res) => {
	try {
		const goods = await Good.find({
			quicGood: { $exists: true }, // Check if `quicGood` exists
			adminId:req.user.adminId, // Match adminId with the current user's adminId
		},["quicGood","wholesale_price","title","barcode"]);
		const goodsLength = await Good.countDocuments({
			quicGood: { $exists: true }, // Count only documents where `quicGood` exists
			adminId: req.user.adminId,  // Match adminId to the current user's adminId
		})
		// Send response
		res.json({
			status: true,
			message: "All Goods only Quic Goods",
			options: {
				goodsLength,
			},
			goods
		});
	} catch (err) {
		res.status(500).json({
			status: false,
			message: "Error retrieving goods",
			error: err.message
		});
	}
};

exports.show = async (req, res) => {
	let good = await Good.findById(req.params.id);
	res.json({
		status: true,
		message: "Good",
		good
	})
}
exports.create = async (req, res) => {
	try {
		let { title, realPrice, wholesale_price, barcode, goodType, plu } = req.body
		if (
			(title == null ?? undefined) ||
			(realPrice == null || undefined) ||
			(wholesale_price == null || undefined) ||
			(barcode == null || undefined) ||
			(goodType == null || undefined)
		) {
			return res.status(400).json({
				status: false,
				message: "title, realPrice, wholesale_price, barcode and type are required"
			});
		}
		let newData = {}

		newData = {
			...req.body,
			adminId: req.user.adminId,
			createUser: req.user.id,
			plu
		}
		let good = await Good.findOne({ barcode, adminId: req.user.adminId })

		if (good) {
			return res.json({
				status: false,
				message: "Good width this barcode alredy exsist"
			})
		}

		if (goodType == "kg") {
			if (plu.length == 0) {
				console.log(1);

				return res.json({
					status: false,
					message: "PlU need to kg Goods"
				})
			}
			let goodPLu = await Good.findOne({ plu })
			if (goodPLu) {
				return res.json({
					status: false,
					message: "Good width this plu already exsist"
				})
			}
		}
		let newGood = await Good.create(newData)
		return res.status(200).json({
			status: false,
			message: "Good created successfully"
		});
	} catch (error) {
		// Handle errors
		return res.status(500).json({
			status: false,
			message: "An error occurred while creating the Goods",
			error: error.message
		});
	}
}
exports.remove = async (req, res) => {
	let good = await Good.findByIdAndUpdate(req.params.id, { archived: true });
	res.json({
		status: true,
		message: "Good Archived",
		good
	})
}
exports.update = async (req, res) => {
	try {
		// Find the existing good by ID
		let good = await Good.findById(req.params.id);
		if (!good) {
			return res.status(200).json({
				status: false,
				message: "Cannot find Good"
			});
		}

		// Extract barcode and plu from the request body
		const { barcode, plu } = req.body;

		// Check if barcode already exists (always required)
		const existingBarcode = await Good.findOne({ barcode, _id: { $ne: req.params.id }, adminId: req.user.adminId });
		if (existingBarcode) {
			return res.status(200).json({
				status: false,
				message: "Barcode already exists"
			});
		}

		// Check if plu exists if goodType is "kg"
		if (good.goodType === "kg") {
			const existingPlu = await Good.findOne({ plu, _id: { $ne: req.params.id }, adminId: req.user.adminId });
			if (existingPlu) {
				return res.status(200).json({
					status: false,
					message: "PLU already exists"
				});
			}
		}

		if (req.body?.quicGood) {
			const existingQuicGood = await Good.findOne({ quicGood: req.body.quicGood, adminId: req.user.adminId, _id: { $ne: req.params.id } });
			if (existingQuicGood) {
				return res.status(200).json({
					status: false,
					message: "Quic number already exsist already exists"
				});
			}
		}
		// Proceed with updating the good if no conflicts are found
		good = await Good.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true });

		return res.status(200).json({
			status: true,
			message: "Good updated successfully",
			good
		});
	} catch (error) {
		console.error(error);

		// Handle errors
		return res.status(500).json({
			status: false,
			message: "An error occurred while updating the Good",
			error: error.message
		});
	}
};

exports.countGet = async (req, res) => {
	let good = await Good.findById(req.params.id, ["count"])
	if (good) {
		res.json({
			status: true,
			message: "Good special",
			good: good
		})
	} else {
		res.json({
			status: false,
			message: "Good is not definded",
		})
	}
}
exports.countAdd = async (req, res) => {
	let good = await Good.findById(req.params.id)
	if (good) {
		let count = req.body.count
		if (count.length == 0) {
			res.json({
				status: false,
				message: "Inter the product count",
			})
		} else {
			const combinedColors = [...good.count, ...count].reduce((acc, obj) => {
				const existingColor = acc.find(item => item.color === obj.color);
				if (existingColor) {
					existingColor.count += obj.count;
				} else {
					acc.push({ color: obj.color, count: obj.count });
				}
				return acc;
			}, []);
			let newCount = await Good.findByIdAndUpdate(req.params.id, {
				count: combinedColors
			})
			res.json({
				status: true,
				message: "Count canged",
			})
		}
	} else {
		res.json({
			status: false,
			message: "Good is not definded",
		})
	}
}
