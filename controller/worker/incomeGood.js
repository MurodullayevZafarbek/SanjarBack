const Good = require("../../model/Good");
const IncomeGood = require("../../model/IncomeGood");
let incomeGood = {}
incomeGood.index = async (req, res) => {
	try {
		let { currentPage = 0, limit = 10, sort, eq, incomeGoodId, amount, createdAt } = req.query;

		currentPage = parseInt(currentPage);
		limit = parseInt(limit);

		// Base query
		let query = { ...req.body,adminId: req.user.adminId };

		// Filter by user IDs if provided
		if (incomeGoodId) {
			const userIdsArray = incomeGoodId.split(",");
			query.incomeGood = { $in: userIdsArray };
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
		const [incomeGood, incomeGoodLength] = await Promise.all([
			IncomeGood.find(query)
				.populate('incomeUser',["firstName"])
				.skip(limit * currentPage)
				.limit(limit)
				.sort(sortOptions),
			IncomeGood.countDocuments(query),
		]);

		// Send response
		res.json({
			status: true,
			message: 'Payments fetched successfully',
			options: {
				incomeGoodLength,
				currentPage,
				limit,
			},
			incomeGood,
		});
	} catch (err) {
		res.status(500).json({
			status: false,
			message: 'Error retrieving payments',
			error: err.message,
		});
	}
}
incomeGood.show = async (req, res) => {
	try {
		let incomeGood = await IncomeGood.findById(req.params.id).populate("goods.good_id",['title',"goodType"]);
	res.json({
		status: true,
		message: "Income good",
		incomeGood
	})
	} catch (error) {
		res.json({
			status: false,
			message: "Semthing went wrong",
			message:error.message
		})
	}
}
incomeGood.create = async (req, res) => {
	try {
		let { name, goods, pay_type, sale_type, soliq, discauntAmaunt, amount } = req.body
		if (
			(goods == null ?? undefined) ||
			(amount == null ?? undefined)
		) {
			return res.json({
				status: false,
				message: "Goods and Amount not founded"
			})
		}
		let newIncomeGood = await IncomeGood.create({ ...req.body, incomeUser: req.user.id, adminId: req.user.adminId })

		req.body.goods.forEach(async good => {
			let dbGood = await Good.findById(good.good_id)

			if (dbGood?.statistic == true) {
				if (dbGood.goodType == "pcs") {
					let count = +dbGood.count

					dbGood.count = count + good.count
					dbGood.save()
				} else if (dbGood.goodType == "kg") {
					weight = +dbGood.weight

					dbGood.weight = weight + good.weight
					dbGood.save()
				}
				else {
					return res.json({
						status: false,
						message: "Contact to developer"
					})
				}
			}
			// let updGood = await Good.findByIdAndUpdate(good.good_id, { count: combinedColors })
		});
		res.json({
			status: true,
			message: "Good Registred successfully",
			income: newIncomeGood
		})
	} catch (e) {
		res.json({
			status: false,
			message: "somthing went wrong",
			error: e
		})
	}
}
module.exports = incomeGood
