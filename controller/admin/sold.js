const { Types, default: mongoose } = require("mongoose");
const Sold = require("../../model/Sold");
let sold = {}
sold.index = async (req, res) => {
	try {
		let { currentPage = 0, limit = 10, sort, eq, soldId, amount, createdAt } = req.query;

		currentPage = parseInt(currentPage);
		limit = parseInt(limit);

		// Base query
		let query = { ...req.body, adminId: new Types.ObjectId(req.user.id), };
		// Filter by user IDs if provided
		if (soldId) {
			const userIdsArray = soldId.split(",");
			query.sold = { $in: userIdsArray };
		}

		// Filter by paymentSum
		if (amount) {
			const [min, max] = amount.split('-');
			query.amount = {};
			if (min) query.amount.$gte = parseInt(min);
			if (max) query.amount.$lte = parseInt(max);
		}

		// Filter by createdAt range
		if (createdAt) {
			const [minDate, maxDate] = createdAt.split('-');
			query.createdAt = {};
			if (minDate) query.createdAt.$gte = new Date(minDate);
			if (maxDate) query.createdAt.$lte = new Date(maxDate);
		}

		// Apply equality filters (eq can be array or single string)
		if (eq) {
			const filters = Array.isArray(eq) ? eq : [eq];
			filters.forEach(filter => {
				const [field, value] = filter.split('.');
				if (field && value) {
					query[field] = { $regex: value, $options: 'i' };
				}
			});
		}

		// Sorting options
		let sortOptions = {};
		if (sort) {
			const [sortField, sortOrder] = sort.split('.');
			sortOptions[sortField] = sortOrder === 'ABC' ? 1 : -1;
		}

		const pipeline = [
			{ $match: query }, // Apply the base query filters

			// Lookup to populate the 'sold' field with the 'User' details
			{
				$lookup: {
					from: "users", // The name of the collection you're populating from (User model)
					localField: "sold", // Field in the Sold document
					foreignField: "_id", // Field in the User collection (typically _id)
					as: "soldDetails", // The name of the resulting array field
				},
			},

			// Optionally unwind the 'soldDetails' array if you expect a single match per document
			{ $unwind: { path: "$soldDetails", preserveNullAndEmptyArrays: true } },

			// Sort the results
			{ $sort: sortOptions },

			// Pagination
			{ $skip: limit * currentPage },
			{ $limit: limit },
			{
				$project: {
					_id: 1, // Keep the _id field
					adminId: 1,
					amount: 1,
					createdAt: 1,
					discountAmount: 1,
					pay_type: 1,
					soldUser: {
						_id: "$soldDetails._id",
						firstName: "$soldDetails.firstName",
						lastName: "$soldDetails.lastName",

					},
					soliq: 1,
					updatedAt: 1,
				},
			},
		];
		// Fetch payments with filters, sorting, and pagination
		const [sold, soldLength] = await Promise.all([
			Sold.aggregate(pipeline),
			Sold.countDocuments(query),
		]);


		// Send response
		res.json({
			status: true,
			message: 'Payments fetched successfully',
			options: {
				soldLength,
				currentPage,
				limit,
			},
			sold,
		});
	} catch (err) {
		res.status(500).json({
			status: false,
			message: 'Error retrieving payments',
			error: err.message,
		});
	}
}
sold.allGoods = async (req, res) => {
	try {
		let { currentPage = 0, limit = 10, sort, eq, soldId, amount, createdAt } = req.query;

		currentPage = parseInt(currentPage);
		limit = parseInt(limit);

		// Base query
		let query = { ...req.body, adminId: new Types.ObjectId(req.user.id), };
		// Filter by user IDs if provided
		if (soldId) {
			const userIdsArray = soldId.split(",");
			query.sold = { $in: userIdsArray };
		}

		// Filter by paymentSum
		if (amount) {
			const [min, max] = amount.split('-');
			query.amount = {};
			if (min) query.amount.$gte = parseInt(min);
			if (max) query.amount.$lte = parseInt(max);
		}

		// Filter by createdAt range
		if (createdAt) {
			const [minDate, maxDate] = createdAt.split('-');
			query.createdAt = {};
			if (minDate) query.createdAt.$gte = new Date(minDate);
			if (maxDate) query.createdAt.$lte = new Date(maxDate);
		}

		// Apply equality filters (eq can be array or single string)
		if (eq) {
			const filters = Array.isArray(eq) ? eq : [eq];
			filters.forEach(filter => {
				const [field, value] = filter.split('.');
				if (field && value) {
					query[field] = { $regex: value, $options: 'i' };
				}
			});
		}

		// Sorting options
		let sortOptions = {};
		if (sort) {
			const [sortField, sortOrder] = sort.split('.');
			sortOptions[sortField] = sortOrder === 'ABC' ? 1 : -1;
		}

		const pipeline = [
			{ $match: query }, // Apply the base query filters
			{ $unwind: { path: "$goods", preserveNullAndEmptyArrays: true } },

			// Lookup to populate the 'sold' field with the 'User' details
			{
				$lookup: {
					from: "goods", // The name of the collection you're populating from (User model)
					localField: "goods._id", // Field in the Sold document
					foreignField: "_id", // Field in the User collection (typically _id)
					as: "goodDetails", // The name of the resulting array field
				},
			},
			{
				$addFields: {
					goodDetail: { $arrayElemAt: ["$goodDetails", 0] }
				}
			},
			{
				$project: {
					_id: "$goods._id",
					amount: 1,
					// Fields from embedded "goods" object in Sold document
					wholesale_price: "$goods.wholesale_price",
					price: "$goods.price",
					count: "$goods.count",
					weight: "$goods.weight",

					// Fields from the first matched goodDetails (from goods collection)
					title: "$goodDetail.title",
					goodType: "$goodDetail.goodType",
					realPrice: "$goodDetail.realPrice",
				}
			},
			{
				$group: {
					_id: "$_id", // group by product
					title: { $first: "$title" },
					goodType: { $first: "$goodType" },
					realPrice: { $first: "$realPrice" },
					wholesale_price: { $first: "$wholesale_price" },

					totalWeight: {
						$sum: {
							$cond: [{ $eq: ["$goodType", "kg"] }, "$weight", 0]
						}
					},
					totalCount: {
						$sum: {
							$cond: [{ $eq: ["$goodType", "pcs"] }, "$count", 0]
						}
					},
				}
			},
			// // Sort the results
			{ $sort: sortOptions },
			// Pagination
			{ $skip: limit * currentPage },
			{ $limit: limit },
		];
		// Fetch payments with filters, sorting, and pagination
		const [sold, soldLength] = await Promise.all([
			Sold.aggregate(pipeline),
			Sold.countDocuments(query),
		]);

		console.log(sold);

		// Send response
		res.json({
			status: true,
			message: 'Payments fetched successfully',
			options: {
				soldLength,
				currentPage,
				limit,
			},
			sold,
		});
	} catch (err) {
		res.status(500).json({
			status: false,
			message: 'Error retrieving payments',
			error: err.message,
		});
	}
}
sold.show = async (req, res) => {
	try {
		const soldWithGoods = await Sold.aggregate([
			{
				$match: { _id: new mongoose.Types.ObjectId(req.params.id) }, // Convert req.params.id to ObjectId
			},
			{
				$unwind: "$goods"
			},
			{
				$lookup: {
					from: 'goods', // The name of the Good collection
					localField: 'goods._id', // Field in the Sold collection
					foreignField: '_id', // Field in the Good collection
					as: 'goodsDetails', // The output field containing matched Good documents
				},
			},
			{
				$unwind: {
					path: "$goodsDetails", // Unwind to get each good detail separately
					preserveNullAndEmptyArrays: true, // Optional: keep the Sold even if there's no match
				},
			},
			{
				$group: {
					_id: "$_id", // Group by Sold's _id
					name: { $first: "$name" }, // Include the name field
					amount: { $first: "$amount" }, // Include the amount field
					pay_type: { $first: "$pay_type" }, // Include the amount field
					updatedAt: { $first: "$updatedAt" }, // Include the amount field
					goods: {
						$push: {
							good_id: "$goods.good_id", // Add good_id from the goods array
							count: "$goods.count", // Add count from goods array
							weight: "$goods.weight", // Add weight from goods array
							realPrice: "$goods.realPrice", // Add price from goods array
							wholesale_price: "$goods.wholesale_price", // Add price from goods array
							good_details: "$goodsDetails", // Include matched good details
						},
					},
				},
			},
			{
				$project: {
					_id: 1, // Include the _id field
					name: 1, // Include name from the Sold document
					amount: 1, // Include amount from the Sold document
					goods: 1, // Include the goods array with merged details
					pay_type: 1, // Include the goods array with merged details
					updatedAt: 1
				},
			},
		]);

		res.json({
			status: true,
			message: "Sold",
			sold: soldWithGoods[0],
		});
	} catch (error) {
		console.error(error);

		res.json({
			status: false,
			message: "Error fetching sold item",
			error: error.message,
		});
	}
};

module.exports = sold
