exports.superAdmin = (req, res, next) => {
    if (req.user.role === "superAdmin") {
        next();
    } else {
        res.json({
            status: false,
            message: "You do not have permission"
        })
    }
}
exports.admin = (req, res, next) => {
    if (req.user.role === "admin") {
        next();
    } else {
        res.json({
            status: false,
            message: "You do not have permission"
        })
    }
}
exports.worker = (req, res, next) => {
    if (req.user.role === "worker") {
        next();
    } else {
        res.json({
            status: false,
            message: "You do not have permission"
        })
    }
}
