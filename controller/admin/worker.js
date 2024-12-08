const User = require("../../model/User")
const bcrypt = require("bcrypt")

exports.index = async (req, res) => {
	try {

		// Destructure query parameters with default values
		let { currentPage = 0, limit = 10, archived, sort, eq } = req.query;
		currentPage = parseInt(currentPage);
		limit = parseInt(limit);

		// Base query for filtering archived status and role
		let workers = await User.findById(req.user.id)
		workers = workers.worker

		let query = { role: "worker", _id: { $in: workers } };
		if(archived || archived == false) query.archived = archived
		// Apply equality filters using RegEx (case-insensitive)
		if (eq) {
			const filters = Array.isArray(eq) ? eq : [eq]; // Ensure eq is an array
			filters.forEach(filter => {
				const [field, value] = filter.split('.');
				if (field && value) {
					query[field] = { $regex: value, $options: "i" }; // Use RegEx for case-insensitive matching
				}
			});
		}

		// Define sorting options if provided
		let sortOptions = {};
		if (sort) {
			const [sortField, sortOrder] = sort.split('.');
			sortOptions[sortField] = sortOrder === "ABC" ? 1 : -1; // 1 for Aending, -1 for descending
		}

		// Query the database for paginated, filtered, and sorted results
		const [users, userLength] = await Promise.all([
			User.find(query, "firstName lastName email phoneNumber region createdAt archived")
				.skip(limit * currentPage)
				.limit(limit)
				.sort(sortOptions),
			User.countDocuments(query)
		]);

		// Send response
		res.json({
			status: true,
			message: "All Admins",
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

exports.show = async (req, res) => {
	let user = await User.findById(req.params.id,
		["firstName", "lastName", "email", "phoneNumber", "region", "createdAt","role",'updatedAt']
	);
	res.json({
		status: true,
		message: "Worker",
		user
	})
}

exports.create = async (req, res) => {
	try {
		const { email, password, lastName, firstName, region, phoneNumber } = req.body;

		// Validate required fields
		if (!password || !firstName || !phoneNumber) {
			return res.status(200).json({
				status: false,
				message: "First name, password, and phone number are required"
			});
		}
		if (!Number(phoneNumber)) {
			return res.json({
				status: false,
				message: 'Phone number must be a number',
			})
		}
		// Check if user already exists (case-insensitive email check)
		const user = await User.findOne({ phoneNumber });

		if (user) {
			return res.status(200).json({
				status: false,
				message: "User with this phone number already exists"
			});
		}

		// Generate salt and hash password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// Create new user
		const newUser = {
			email,
			password: hashedPassword,
			lastName,
			firstName,
			region,
			phoneNumber,
			role: "worker"  // Assigning admin status
		};

		const createdUser = await User.create(newUser);
		const updateAdmin = await User.findByIdAndUpdate(req.user.id, {
			$push: { worker: createdUser._id }
		});
		if (!updateAdmin) {
			return res.status(400).json({
				status: false,
				message: "Error in update Admin"
			});
		}
		// Send success response
		return res.status(201).json({
			status: true,
			message: "User created successfully",
			data: createdUser  // Optionally return created user data
		});

	} catch (error) {
		// Handle errors
		return res.status(500).json({
			status: false,
			message: "An error occurred while creating the user",
			error: error.message
		});
	}
};

exports.remove = async (req, res) => {
	let users = await User.findByIdAndUpdate(req.params.id, { archived: true });
	res.json({
		status: true,
		message: "User Removed"
	})
}
exports.update = async (req, res) => {
	try {
		const { firstName, lastName, email, phoneNumber,archived, region } = req.body;

		// Find the user by ID and update the provided fields
		const user = await User.findByIdAndUpdate(
			req.params.id,
			{ firstName, lastName, email, phoneNumber, region,archived },
			{ new: true, runValidators: true } // Return the updated document and run validation
		);

		if (!user) {
			return res.status(404).json({
				status: false,
				message: "Worker not found",
			});
		}

		res.json({
			status: true,
			message: "Worker updated successfully",
			user // Send back the updated user
		});
	} catch (err) {
		res.status(400).json({
			status: false,
			message: "Error updating Worker",
			error: err.message
		});
	}
}
