const { Types, default: mongoose } = require("mongoose");
const Sold = require("../../model/Sold");
let statistic = {}
statistic.soldStatistic = async (req, res) => {
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
statistic.today = async (req, res) => {
	try {
		// Get the start and end of the current day
		const startOfDay = new Date();
		startOfDay.setHours(0, 0, 0, 0); // Set to midnight
		const endOfDay = new Date();
		endOfDay.setHours(23, 59, 59, 999); // Set to end of the day

		const result = await Sold.aggregate([
			{
				$match: {
					createdAt: {
						$gte: startOfDay, // Match documents created after or at midnight
						$lte: endOfDay,   // Match documents created before or at end of the day
					},
					adminId: new Types.ObjectId(req.user.id)
				},
			},

			{
				$group: {
					_id: null, // Group all documents
					totalAmount: { $sum: "$amount" }, // Sum all amounts
					totalTransaction: { $sum: 1 },
					uzcardTotalAmount: {
						$sum: "$payment.uzcard",
					},
					humoTotalAmount: {
						$sum: "$payment.humo",
					},
					perevodTotalAmount: {
						$sum: "$payment.perevod",
					},
					cashTotalAmount: {
						$sum: "$payment.cash",
					},

				},
			},
			{
				$project: {
					_id: 0, // Exclude the `_id` field in the output
					totalAmount: 1,
					totalTransaction: 1,
					uzcardTotalAmount: 1,
					humoTotalAmount: 1,
					perevodTotalAmount: 1,
					cashTotalAmount: 1,
				},
			},
		]);
		const result1 = await Sold.aggregate([
			{
				$match: {
					createdAt: {
						$gte: startOfDay, // Match documents created after or at midnight
						$lte: endOfDay,   // Match documents created before or at end of the day
					},
					adminId: new Types.ObjectId(req.user.id)
				},
			},
			{
				$unwind: "$goods", // Flatten the goods array
			},
			{
				$group: {
					_id: null, // Group all documents
					totalWeight: { $sum: "$goods.weight" }, // Sum weight of goods
					totalCount: { $sum: "$goods.count" }, // Sum count of goods
					totalWholesalePrice: {
						$sum: {
							$cond: [
								{ $eq: ["$goods.count", null] },
								{ $multiply: ["$goods.wholesale_price", { $divide: ["$goods.weight", 10000] }] },
								{ $multiply: ["$goods.wholesale_price", "$goods.count"] }
							]
						}
					},
					totalRealPrice: {
						$sum: {
							$cond: [
								{ $eq: ["$goods.count", null] },
								{ $multiply: ["$goods.realPrice", { $divide: ["$goods.weight", 10000] }] },
								{ $multiply: ["$goods.realPrice", "$goods.count"] }
							]
						}
					}

				},
			},
			{
				$project: {
					_id: 0, // Exclude the `_id` field in the output
					totalWeight: 1,
					totalCount: 1,
					totalWholesalePrice: 1,
					totalRealPrice: 1,
				},
			},
		]);
		// Additional processing if result is empty
		const data = {
			...{
				totalAmount: 0,
				totalTransaction: 0,
				cashTotalAmount: 0,
				uzcardTotalAmount: 0,
				humoTotalAmount: 0,
				perevodTotalAmount: 0,
				totalWeight: 0,
				totalCount: 0,
				totalWholesalePrice: 0,
				totalRealPrice: 0,
			},
			...result1[0],
			...result[0]
		}

		res.json({
			status: true,
			message: 'Payments and goods stats fetched successfully',
			result: {
				totalAmount: data.totalAmount,
				totalTransaction: data.totalTransaction,
				paymentMethod: {
					uzcard: data.uzcardTotalAmount,
					humo: data.humoTotalAmount,
					perevod: data.perevodTotalAmount,
					cash: data.cashTotalAmount,
				},
				totalWeight: data.totalWeight / 10000,
				totalCount: data.totalCount,
				totalWholesalePrice: data.totalWholesalePrice,
				totalRealPrice: data.totalRealPrice,
			},
		});
	} catch (err) {
		res.status(500).json({
			status: false,
			message: 'Error retrieving today stats',
			error: err.message,
		});
	}
};


module.exports = statistic
