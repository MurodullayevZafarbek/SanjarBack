const Good = require("../../model/Good");
const Sold = require("../../model/Sold");
let sold = {}
sold.index = async (req, res) => {
	try {
		let { currentPage = 0, limit = 10, sort, eq, soldId, amount, createdAt } = req.query;

		currentPage = parseInt(currentPage);
		limit = parseInt(limit);

		// Base query
		let query = { ...req.body };

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

		// Fetch payments with filters, sorting, and pagination
		const [sold, soldLength] = await Promise.all([
			Sold.find(query)
				.skip(limit * currentPage)
				.limit(limit)
				.sort(sortOptions),
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
sold.show = async (req, res) => {
	let sold = await Sold.findById(req.params.id);
	res.json({
		status: true,
		message: "Sold",
		sold
	})
}
sold.create = async (req, res) => {
	try {
		let { name, goods, pay_type, sale_type, soliq, discauntAmaunt, amount } = req.body
		if (
			((goods == null ?? undefined) || goods.length == 0) ||
			((amount == null ?? undefined) || amount == 0)
		) {
			return res.json({
				status: false,
				message: "Goods and Amount not founded"
			})
		}
		let newSold = await Sold.create({ ...req.body, sold: req.user.id })

		req.body.goods.forEach(async good => {
			let dbGood = await Good.findById(good._id)

			if (dbGood?.statistic == true) {
				if (dbGood.goodType == "pcs") {
					let count = dbGood.count
					dbGood.count = count - good.count
					dbGood.save()
				} else if (dbGood.goodType == "kg") {
					weight = dbGood.weight
					dbGood.weight = (weight - good.weight/ 10000).toFixed(2)
					dbGood.save()
				}
				else {
					return res.json({
						status: false,
						message: "Contact to developer"
					})
				}
			}


		// 	// let updGood = await Good.findByIdAndUpdate(good.good_id, { count: combinedColors })
		});
		// res.json({
		// 	status: true,
		// 	message: "Good Solded successfully"
		// })
		res.json({
			status: false,
			message: "Go12312od Solded successfully"
		})
	} catch (e) {
		res.json({
			status: false,
			message: "somthing went wrong",
			error: e
		})
	}
}

module.exports = sold
