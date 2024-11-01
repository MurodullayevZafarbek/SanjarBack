const User = require("../../model/User")
const bcrypt = require("bcrypt")

exports.dashboard = async (req, res) => {
    let users = await User.findById(req.user.id,
    );
    res.json({
        status: true,
        message: "Dashboard",
        users
    })
}
exports.self = async (req, res) => {
    let users = await User.findById(req.user.id,
        ["firstName", "lastName", "email", "phoneNumber", "region"]
    );
    res.json({
        status: true,
        message: "Self",
        users
    })
}
exports.editPassword = async (req, res) => {
    let password = req.body?.password?.trim()
    if ((password == undefined ?? null) || password.length == 0) {
        res.json({
            status: false,
            message: "Fill the form"
        })
    } else {
        let user = await User.findById(req.user.id)
        bcrypt.genSalt(10, async (err, salt) => {
            bcrypt.hash(password, salt, async (err, hash) => {
                try {
                    await User.findByIdAndUpdate(req.user.id, { password: hash })
                    res.json({
                        status: true,
                        message: "password changed successfully"
                    })
                } catch (err) {
                    res.json({
                        status: false,
                        message: "Error",
                        error: err
                    })
                }
            });
        });
    }
}
exports.editPhoneNumber = async (req, res) => {
    let phone = req.body.phoneNumber
    if ((phone == undefined ?? null) || phone.length == 0) {
        res.json({
            status: false,
            message: "Fill the form"
        })
    } else {
        try {
            await User.findByIdAndUpdate(req.user.id, { phoneNumber: phone })
            res.json({
                status: true,
                message: "phoneNumber changed successfully"
            })
        } catch (err) {
            res.json({
                status: false,
                message: "Error",
                error: err
            })
        }
    }
    // let users = await User.findById(req.user.id,
    //     ["firstName", "lastName", "email", "phoneNumber", "region"]
    // );
    // res.json({
    //     status: true,
    //     message: "Self",
    //     users
    // })
}
