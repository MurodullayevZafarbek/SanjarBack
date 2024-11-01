const { model, Schema, default: mongoose } = require("mongoose")

module.exports = model("Payment", new Schema({
	UserID:{
		type: mongoose.ObjectId,
		required: true,
		ref: "user",
		index: true,
	},
	adminId: {
		type: Schema.ObjectId,
		required: true,
		ref: "user",
	},
	PaymnetDate:{
		type:Date,
	},
	PaymentSum:{
		type: Number,
		default: 0
	},
	PaymentLimit:{
		type:Date,
		default: 0
	}
}, { timestamps: true }))
