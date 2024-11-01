const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
    let token = req.cookies.token || req.headers.token || req.query.token || req.body.token
    if (!token) {
        res.json({
            status: false,
            message: "Token is not definded"
        })
    } else {
        jwt.verify(token, process.env.privateKey, (err, decode) => {
            if (err) {
                res.status(401).json(err)
            } else {
                const currentTimestamp = Math.floor(Date.now() / 1000);
                if (decode.exp < currentTimestamp) {
                    res.json({
                        status: false,
                        message: 'Token has expired'
                    });
                } else {
                    req.user = decode
                    next();
                }
            }
        })
    }
}
