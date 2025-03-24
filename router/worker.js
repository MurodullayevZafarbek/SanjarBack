const { Router } = require("express")
const {
    self,
    editPassword,
    editPhoneNumber } = require("../controller/worker/self");
const {
    index,
    create,
    update,
    show,
    countAdd,
    countGet,
    remove,
    plu,
    barcode,
    quicGood} = require("../controller/worker/goods");
const sold = require("../controller/worker/sold");
const loan = require("../controller/worker/loan");
const incomeGood = require("../controller/worker/incomeGood");
const { dashboard } = require("../controller/admin/admin");
const returnSold = require("../controller/worker/returnSold");
const router = Router()

router.get("/", dashboard)
router.get("/self", self)
router.put("/self/edit/password", editPassword)
router.put("/self/edit/phoneNumber", editPhoneNumber)

router.get("/goods", index)
router.get("/goods/barcode/:barcode", barcode)
router.get("/goods/plu", plu)
router.get("/goods/quicGood", quicGood)
router.get("/goods/:id", show)
router.post("/goods", create)
router.put("/goods/:id", update)
router.delete("/goods/:id", remove)

router.get("/good/count/:id", countGet)
router.put("/good/count/:id", countAdd)

router.get("/good/sold", sold.index)
router.post("/good/sold", sold.create)
router.get("/good/sold/:id", sold.show)

router.get("/good/returnSold", returnSold.index)
router.post("/good/returnSold", returnSold.create)
router.get("/good/returnSold/:id", returnSold.show)

router.get("/good/income", incomeGood.index)
router.post("/good/income", incomeGood.create)
router.get("/good/income/:id", incomeGood.show)

router.get("/loan", loan.index)
router.put("/loan/addLoan", loan.addLoan)
router.put("/loan/addPayment", loan.addPayment)
router.get("/loan/:id", loan.show)
router.put("/loan/:id", loan.update)
router.delete("/loan/:id", loan.remove)
router.post("/loan", loan.create)

module.exports = router
