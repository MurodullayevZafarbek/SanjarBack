const User = require("../model/User");

exports.limitAdmin = async (req, res, next) => {
    try {
        let user = await User.findById(req.user.id);

        if (user.limit < new Date()) {
            return res.json({
                status: false,
                message: "Limit is out of range"
            });
        }
        next();
    } catch (error) {
        console.error("Error in admin middleware:", error);
        res.status(500).json({
            status: false,
            message: "An error occurred while processing your request"
        });
    }
};
exports.limitWorker = async (req, res, next) => {
    try {
        let user = await User.findOne({worker:{$in:req.user.id}});

        if (user.limit < new Date()) {
            return res.json({
                status: false,
                message: "Limit is out of range"
            });
        }
        next();
    } catch (error) {
        console.error("Error in admin middleware:", error);
        res.status(500).json({
            status: false,
            message: "An error occurred while processing your request"
        });
    }
};
