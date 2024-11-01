const { model, Schema } = require("mongoose")

module.exports = model("IncomeGood", new Schema({
	name: {
		type: String,
		default: "Income User"
	},
	pay_type: {
		type: String,
		enum: ["card", "cash", "account"],
		default: "cash"
	},
	incomeUser: {
		type: Schema.ObjectId,
		require: true,
		ref: "user",
	},
	goods: [
		{
			good_id: { type: Schema.ObjectId ,ref:"Good" },
			count: Number,
			weight: Number,
			price: Number,
		}
	],
	adminId: {
		type: Schema.ObjectId,
		required: true,
		ref: "user",
	},
	amount: {
		type: Number,
		require: true,
	}
}, { timestamps: true }))
