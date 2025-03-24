const { model, Schema } = require("mongoose")

module.exports = model("returnSold", new Schema({
    name: {
        type: String,
        default: "User"
    },
    payment: {
        cash: {
            type: Number,
            default: 0,
        },
        card: {
            type: Number,
            default: 0,
        },
        humo: {
            type: Number,
            default: 0,
        },
        uzcard: {
            type: Number,
            default: 0,
        },
        qarz: {
            type: Number,
            default: 0,
        }
    },
    amount: {
        type: Number,
        require: true,
    },
    returnAmount: {
        type: Number,
        require: true,
    },
    sale_type: {
        type: String,
        enum: ["boxed", "wholesale"],
        default: "wholesale"
    },
    returnSold: {
        type: Schema.ObjectId,
        ref: "Sold",
        require: true,
    },
    goods: [
        {
            good_id: { type: Schema.ObjectId,ref: "Good"},
            count: Number,
            weight: Number,
            price: Number,
        }
    ],
}, { timestamps: true }))
