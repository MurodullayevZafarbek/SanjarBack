const { Router } = require("express")
const router = Router()
const { mxik } = require("../controller/mxik")

router.get("/:barcode", mxik)

module.exports = router
