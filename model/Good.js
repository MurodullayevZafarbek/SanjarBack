const { model, Schema } = require("mongoose")

module.exports = model("Good", new Schema({
	title: {
		type: String,
		required: true
	},
	description: {
		type: String,
	},
	realPrice: {
		type: Number,
	},
	boxed_price: {
		type: Number,
	},
	wholesale_price: {
		type: Number,
	},
	barcode: {
		type: String,
		required: true,
		index: true
	},
	relationBarcodes: [{
		type: String,
		required: true
	}],
	type: {
		type: [
			{
				type: String,
			}
		],
	},
	adminId: {
		type: Schema.ObjectId,
		required: true,
		ref: "User",
	},
	createUser: {
		type: Schema.ObjectId,
		required: true,
		ref: "User",
	},
	goodType:{
		type:String,
		enum:["kg",'pcs']
	},
	count: {
		type: Number,
		default:0
	},
	weight: {
		type: Number,
		default:0
	},
	plu:{
		type:Number,
		unique:true
	},
	statistic: {
		type: Boolean,
		default: false
	},
	archived:{
		type: Boolean,
		default: false
	}
}, { timestamps: true }))
