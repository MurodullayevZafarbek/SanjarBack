const { model, Schema } = require("mongoose")


module.exports = model("user", new Schema({
    firstName: {
        type: String,
        require: true
    },
    lastName: {
        type: String,
    },
    email: {
        type: String,
    },
    region: {
        city: String,
        street: String
    },
    phoneNumber: {
        type: Number,
    },
    password: {
        type: String,
        require: true
    },
    worker: [
        { type: Schema.ObjectId, }
    ],
    role: {
        type: String,
        enum: ["superAdmin", "admin", "worker"],
        default: "worker",
    },
    archived:{
        type: Boolean,
        default: false
    },
    payment:{
        type: Number,
    },
    limit:{
        type:Date,
        default: Date.now
    },
}, { timestamps: true }))
