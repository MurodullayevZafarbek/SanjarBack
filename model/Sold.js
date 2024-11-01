const { model, Schema } = require("mongoose")

module.exports = model("Sold", new Schema({
    name: {
        type: String,
        default: "User"
    },
    pay_type: {
        type: String,
        enum: ["card", "cash", "account"],
        default: "cash"
    },
    sale_type: {
        type: String,
        enum: ["boxed", "wholesale"],
        default: "wholesale"
    },
    soliq: {
        type: Boolean,
        default: false,
    },
    discauntAmount: {
        type: Number,
        default: 0
    },
    sold:{
        type: Schema.ObjectId,
        require: true,
    },
    goods: [
        {
            good_id: { type: Schema.ObjectId },
            count: Number,
            weight: Number,
            price: Number,
        }
    ],
    amount: {
        type: Number,
        require:true,
    }
}, { timestamps: true }))
