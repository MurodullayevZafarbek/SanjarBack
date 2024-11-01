const Payment = require("../../model/Payment");
const User = require("../../model/User");

// Fetch paginated payments with filtering and sorting
exports.index = async (req, res) => {
    try {
        let { currentPage = 0, limit = 10, sort, eq, usersId, paymentSum, PaymentLimit, createdAt } = req.query;

        currentPage = parseInt(currentPage);
        limit = parseInt(limit);

        // Base query
        let query = { ...req.body };

        // Filter by user IDs if provided
        if (usersId) {
            const userIdsArray = usersId.split(",");
            query.UserID = { $in: userIdsArray };
        }

        // Filter by paymentSum
        if (paymentSum) {
            const [min, max] = paymentSum.split('-');
            query.PaymentSum = {};
            if (min) query.PaymentSum.$gte = parseInt(min);
            if (max) query.PaymentSum.$lte = parseInt(max);
        }

        // Filter by PaymentLimit range
        if (PaymentLimit) {
            const [minLimit, maxLimit] = PaymentLimit.split('-');
            query.PaymentLimit = {};
            if (minLimit) query.PaymentLimit.$gte = new Date(minLimit);
            if (maxLimit) query.PaymentLimit.$lte = new Date(maxLimit);
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
        sortOptions = Object.keys(sortOptions).length ? sortOptions : { date: -1 };
        // Fetch payments with filters, sorting, and pagination
        const [payments, paymentLength] = await Promise.all([
            Payment.aggregate([
                // Match the query,

                // Sort based on sortOptions
                { $sort: sortOptions },

                // Skip to the desired page
                { $skip: limit * currentPage },

                // Limit the number of documents
                { $limit: limit },

                // Lookup to join the UserID field with the User collection
                {
                    $lookup: {
                        from: "users",  // The name of the User collection
                        localField: "UserID",
                        foreignField: "_id",
                        as: "userDetails"
                    }
                },
                { $unwind: "$userDetails" },
                // Optionally, select only the needed fields from userDetails
                {
                    $project: {
                        _id: 1,
                        PaymnetDate: 1,
                        PaymentSum: 1,
                        PaymentLimit: 1, // Example payment field
                        firstName: "$userDetails.firstName",
                        phoneNumber:"$userDetails.phoneNumber",
                        userId:"$userDetails._id",
                        payment:"$userDetails.payment",
                        createdAt:1
                    }
                },
                { $match: query }
            ]),
            // Get the total count of documents matching the query
            Payment.aggregate([
                { $match: query },

                // Count the total number of documents
                { $count: "totalCount" }
            ]).then(res => (res[0] ? res[0].totalCount : 0)) // Return the count or 0 if none
        ]);


        // Send response
        res.json({
            status: true,
            message: 'Payments fetched successfully',
            options: {
                paymentLength,
                currentPage,
                limit,
            },
            payments,
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: 'Error retrieving payments',
            error: err.message,
        });
    }
};

// Fetch a single payment by ID
exports.show = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({
                status: false,
                message: "Payment not found"
            });
        }

        res.json({
            status: true,
            message: "Payment details",
            payment
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Error fetching payment",
            error: err.message
        });
    }
};

// Create a new payment
exports.create = async (req, res) => {
    try {
        const { UserID, PaymentSum } = req.body;

        // Validate required fields
        if (!UserID || !PaymentSum) {
            return res.status(200).json({
                status: false,
                message: "UserID and PaymentSum are required"
            });
        }

        // Find the user and check if the payment exists
        const user = await User.findById(UserID).select('payment limit'); // Only select needed fields
        if (!user || !user.payment) {
            return res.status(200).json({
                status: false,
                message: "User payment information not found"
            });
        }

        // Validate the payment sum
        if (PaymentSum < user.payment || !Number.isInteger(PaymentSum / user.payment)) {
            return res.status(200).json({
                status: false,
                message: "Invalid payment sum"
            });
        }

        // Add months based on payment sum and user's payment
        const limitDate = new Date(user.limit); // Convert the limit to a Date object
        limitDate.setMonth(limitDate.getMonth() + PaymentSum / user.payment); // Add n months

        // Create and save the payment record
        const payment = await Payment.create({
            UserID,
            PaymentDate: new Date(),
            PaymentSum,
            adminId: user._id,
            PaymentLimit: limitDate
        });

        // Update the user's limit with the new limitDate
        user.limit = limitDate;
        await user.save();

        // Respond with success message
        return res.status(201).json({
            status: true,
            message: "Payment created and user limit updated successfully",
            payment
        });
    } catch (err) {
        // Catch and return error response
        return res.status(500).json({
            status: false,
            message: "Error creating payment",
            error: err.message
        });
    }
};

// Update a payment by ID
exports.update = async (req, res) => {
    try {
        // const { UserID, PaymentDate, PaymentSum, PaymentLimit } = req.body;

        // // Find and update the payment
        // const payment = await Payment.findByIdAndUpdate(
        // 	req.params.id,
        // 	{ UserID, PaymentDate, PaymentSum, PaymentLimit },
        // 	{ new: true, runValidators: true }
        // );

        // if (!payment) {
        // 	return res.status(404).json({
        // 		status: false,
        // 		message: "Payment not found"
        // 	});
        // }

        res.json({
            status: true,
            message: "If you want to update contact to developer",
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Error updating payment",
            error: err.message
        });
    }
};

// Delete (remove) a payment by ID
exports.remove = async (req, res) => {
    try {
        // const payment = await Payment.findByIdAndDelete(req.params.id);

        // if (!payment) {
        // 	return res.status(404).json({
        // 		status: false,
        // 		message: "Payment not found"
        // 	});
        // }

        res.json({
            status: true,
            message: "if you want to delet contact to developer",
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Error removing payment",
            error: err.message
        });
    }
};
