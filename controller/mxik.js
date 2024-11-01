const Mxik = require("../model/Mxik")
exports.mxik = async (req, res) => {
    try {
        let { barcode } = req.params; // Extract barcode from request parameters

        // Find the document in the Mxik collection where barcode matches
        const foundDocument = await Mxik.findOne({ barcode: barcode });

        if (foundDocument) {
            // Document found, send it in the response
            res.status(200).json({
				data:foundDocument,
				message:"success",
			});
        } else {
            // No document found, send a not found response
            res.status(200).json({ message: 'Document not found' });
        }
    } catch (error) {
        console.error('Error finding document:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
