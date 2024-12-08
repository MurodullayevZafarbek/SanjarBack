const User = require("../../model/User")
const bcrypt = require("bcrypt")

exports.index = async (req, res) => {
	try {
		// Destructure query parameters with default values
		let { currentPage = 0, limit = 10, sort, eq } = req.query;

		currentPage = parseInt(currentPage);
		limit = parseInt(limit);

		// Base query for filtering archived status and role
		let query = { role: "admin" };

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
			User.find(query, "firstName lastName email phoneNumber region createdAt limit payment archived")
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
};

exports.show = async (req, res) => {
	try {
		let user = await User.findById(req.params.id);
		res.json({
			status: true,
			message: "Admin",
			user
		})
	} catch (err) {
		res.json({
			status: false,
			message: "User not founded",
		})
	}
}

exports.create = async (req, res) => {
	try {
		const { email, password, lastName, firstName, region, phoneNumber, payment } = req.body;

		// Validate required fields
		if (!password || !firstName || !phoneNumber) {
			return res.json({
				status: false,
				message: "First name, password, and phone number are required"
			});
		}
		if (!Number(phoneNumber)) {
			return res.json({
				status: false,
				message: `phoneNumber must be a number`,
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
			payment,
			role: "admin"  // Assigning admin status
		};

		const createdUser = await User.create(newUser);

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
	try {
		// Find the user by ID and update the "active" status to false
		const user = await User.findByIdAndUpdate(req.params.id, { archived: true }, { new: true });

		// Check if the user was found and updated
		if (!user) {
			return res.status(404).json({
				status: false,
				message: "User not found"
			});
		}

		// Respond with success message
		return res.json({
			status: true,
			message: "User removed (deactivated) successfully",
			data: user  // Optionally return the updated user
		});

	} catch (error) {
		// Catch any errors and send appropriate response
		return res.status(500).json({
			status: false,
			message: "An error occurred while removing the user",
			error: error.message
		});
	}
};

exports.update = async (req, res) => {
	try {
		const { firstName, lastName, email, phoneNumber, region, limit, payment } = req.body;

		// Find the user by ID and update the provided fields
		const user = await User.findByIdAndUpdate(
			req.params.id,
			{ firstName, lastName, email, phoneNumber, region, limit, payment },
			{ new: true, runValidators: true } // Return the updated document and run validation
		);

		if (!user) {
			return res.status(404).json({
				status: false,
				message: "User not found",
			});
		}

		res.json({
			status: true,
			message: "User updated successfully",
			user // Send back the updated user
		});
	} catch (err) {
		res.status(400).json({
			status: false,
			message: "Error updating user",
			error: err.message
		});
	}
}
