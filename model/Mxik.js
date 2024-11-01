const { model, Schema } = require("mongoose")
module.exports = model("Mxik", new Schema({
    barcode: { type: String, required: true },
    mxik: { type: String },
    title: { type: String },
    goodType: { type: String }
}));
