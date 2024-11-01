const { Router } = require("express")
const { signIn } = require("../controller/auth")
const router = Router()

router.post('/', signIn)

module.exports = router
