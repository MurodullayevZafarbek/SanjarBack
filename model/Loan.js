const { model, Schema } = require("mongoose")

module.exports = model("Loan", new Schema({
    name: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
    },
    adminId: {
        type: Schema.ObjectId,
        ref: "User",
    },
    archived: {
        type: Boolean,
        default: false,
    },
    payed: [
        {
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
            }
        },
    ],
    solds: [{
        type: Schema.ObjectId,
        ref: "Sold"
    }],
    comment: {
        type: String,
    },
}, { timestamps: true }))
