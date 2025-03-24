const Loan = require("../../model/Loan");

exports.index = async (req, res) => {
	try {
		// Destructure query parameters with default values
		let { currentPage = 0, limit = 10, archived, sort, eq } = req.query;
		currentPage = parseInt(currentPage);
		limit = parseInt(limit);

		// Base query for filtering archived status and role

		let query = { adminId: req.user.adminId };
		if (archived || archived == false) query.archived = archived
		// Apply equality filters using RegEx (case-insensitive)
		if (eq) {
			const filters = Array.isArray(eq) ? eq : [eq]; // Ensure eq is an array
			const orConditions = filters.map(filter => {
				const [field, value] = filter.split('.');
				if (field && value) {
					return { [field]: { $regex: value, $options: "i" } }; // Use RegEx for case-insensitive matching
				}
			}).filter(Boolean); // Remove any undefined values

			if (orConditions.length > 0) {
				query.$or = orConditions; // Apply OR condition to all filters
			}
		}

		// Define sorting options if provided
		let sortOptions = {};
		if (sort) {
			const [sortField, sortOrder] = sort.split('.');
			sortOptions[sortField] = sortOrder === "ABC" ? 1 : -1; // 1 for Aending, -1 for descending
		}

		// Query the database for paginated, filtered, and sorted results
		const [data, dataLength] = await Promise.all([
			Loan.find(query, "name phoneNumber payed createdAt updatedAt comment archived")
				.skip(limit * currentPage)
				.limit(limit)
				.populate('solds')
				.sort(sortOptions),
			Loan.countDocuments(query)
		]);

		// Send response
		res.json({
			status: true,
			message: "All Loans",
			options: {
				dataLength,
				currentPage,
				limit,
			},
			loans:data
		});
	} catch (err) {

		res.status(500).json({
			status: false,
			message: "Error retrieving launchs",
			error: err.message
		});
	}
}

exports.show = async (req, res) => {
	try {
		let service = await Loan.findById(req.params.id);
		res.json({
			status: true,
			message: "Loan",
			service
		})
	} catch (error) {
		// Handle errors
		return res.status(500).json({
			status: false,
			message: "An error occurred while getting a Loan",
			error: error.message
		});
	}
}

exports.create = async (req, res) => {
	try {
		const { name, phoneNumber,comment } = req.body;
		// Validate required fields
		if (!name || !phoneNumber) {
			return res.status(200).json({
				status: false,
				message: "firstName, and phoneNumber are required"
			});
		}
		if (!Number(phoneNumber)) {
			return res.json({
				status: false,
				message: 'phoneNumber must be a number',
			})
		}
		// Check if user already exists (case-insensitive email check)
		const data = await Loan.findOne({ phoneNumber,adminId:req.user.adminId });

		if (data) {
			return res.status(200).json({
				status: false,
				message: "Loan with this phoneNumber already exists"
			});
		}

		// Create new Group
		const newData = {
			name, phoneNumber,comment, adminId: req.user.adminId
		};
		const createdData = await Loan.create(newData);
		return res.status(201).json({
			status: true,
			message: "Loan created successfully",
			data: createdData  // Optionally return created user data
		});

	} catch (error) {
		// Handle errors
		return res.status(500).json({
			status: false,
			message: "An error occurred while creating a Loan",
			error: error.message
		});
	}
};

exports.remove = async (req, res) => {
	let data = await Loan.findByIdAndUpdate(req.params.id, { archived: true });
	res.json({
		status: true,
		message: "Loan Archived"
	})
}
exports.update = async (req, res) => {
	try {
		const { name, phoneNumber,comment } = req.body;

		// Find the user by ID and update the provided fields
		const data = await Loan.findByIdAndUpdate(
			req.params.id,
			{ name, phoneNumber,comment },
			{ new: true, runValidators: true } // Return the updated document and run validation
		);

		if (!data) {
			return res.status(404).json({
				status: false,
				message: "Loan not found",
			});
		}
		res.json({
			status: true,
			message: "Loan updated successfully",
			data // Send back the updated user
		});
	} catch (err) {
		res.status(400).json({
			status: false,
			message: "Error updating Loan",
			error: err.message
		});
	}
}
exports.addLoan = async (req, res) => {
	try {
		const { loanId, soldId } = req.body;

		// Find loan by ID and push soldId to the "solds" array
		const data = await Loan.findByIdAndUpdate(
			loanId,
			{ $push: { solds: soldId } }, // Add soldId to the solds array
			{ new: true, runValidators: true } // Return the updated document and run validation
		);

		if (!data) {
			return res.status(404).json({
				status: false,
				message: "Loan not found",
			});
		}

		res.json({
			status: true,
			message: "Sold ID added to Loan successfully",
			data, // Send back the updated loan
		});
	} catch (err) {
		res.status(400).json({
			status: false,
			message: "Error updating Loan",
			error: err.message,
		});
	}
};
exports.addPayment = async (req, res) => {
	try {
		const { loanId, payment } = req.body;

		// Find loan by ID and push soldId to the "solds" array
		const data = await Loan.findByIdAndUpdate(
			loanId,
			{ $push: { payed: {...payment,createdAt:new Date()} } }, // Add soldId to the solds array
			{ new: true, runValidators: true } // Return the updated document and run validation
		);

		if (!data) {
			return res.status(404).json({
				status: false,
				message: "Loan not found",
			});
		}

		res.json({
			status: true,
			message: "Payment added to Loan successfully",
			data, // Send back the updated loan
		});
	} catch (err) {
		res.status(400).json({
			status: false,
			message: "Error updating Loan",
			error: err.message,
		});
	}
};
