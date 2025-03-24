const { model, Schema } = require("mongoose")

module.exports = model("Sold", new Schema({
    name: {
        type: String,
        default: "User"
    },
    payment: {
        cash: {
            type: Number,
            default: 0,
        },
        perevod: {
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
    discauntAmount: {
        type: Number,
        default: 0
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
    sold: {
        type: Schema.ObjectId,
        ref: "User",
        require: true,
    },
    adminId: {
        type: Schema.ObjectId,
        ref: "User",
    },
    goods: [
        {
            good_id: {
                type: Schema.ObjectId,
                ref: "Good"
            },
            count: Number,
            weight: Number,
            wholesale_price: Number,
            realPrice: Number,
        }
    ]
}, { timestamps: true }))
