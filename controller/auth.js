const jwt = require('jsonwebtoken');
const User = require('../model/User')
const bcrypt = require('bcrypt')
exports.signIn = async (req, res) => {
    try {
        let { phoneNumber, password } = req.body

        if ((phoneNumber == null ?? undefined) || (password == null ?? undefined)) {
            res.json({
                status: false,
                message: `phoneNumber and password is required`,
            })
        } else if (!Number(phoneNumber)) {
            res.json({
                status: false,
                message: `phoneNumber must be a number`,
            })
        } else {
            let user = await User.findOne({ phoneNumber ,archived:false})

            if (user == null) {
                res.json({
                    status: false,
                    message: `user not founded`,
                })
            } else {
                let admin = await User.findOne({ worker: { $in: user._id } })
                let pass = await bcrypt.compare(password, user.password)
                if (!pass) {
                    res.json({
                        status: false,
                        message: `password is incorrect`,
                    })
                } else {
                    const token = await jwt.sign(
                        {
                            id: user._id,
                            role: user.role,
                            adminId: admin?._id,
                            limit:user?.limit
                        },
                        process.env.privateKey,
                        { expiresIn: 5 * 60 * 60 }
                    )
                    res.json({
                        title: "SignIn",
                        token,
                        role: String(user.role).toLowerCase(),
                        status: true,
                        limit: user?.limit
                    })
                }
            }
        }
        // let user = User.find(email:)
    } catch (e) {
        console.log(e.message);
    }
}
