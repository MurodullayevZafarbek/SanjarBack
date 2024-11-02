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
    barcode} = require("../controller/worker/goods");
const sold = require("../controller/worker/sold");
const incomeGood = require("../controller/worker/incomeGood");
const { dashboard } = require("../controller/admin/admin");
const router = Router()

router.get("/", dashboard)
router.get("/self", self)
router.put("/self/edit/password", editPassword)
router.put("/self/edit/phoneNumber", editPhoneNumber)

router.get("/goods", index)
router.get("/goods/barcode/:barcode", barcode)
router.get("/goods/plu", plu)
router.get("/goods/:id", show)
router.post("/goods", create)
router.put("/goods/:id", update)
router.delete("/goods/:id", remove)

router.get("/good/count/:id", countGet)
router.put("/good/count/:id", countAdd)

router.get("/good/sold", sold.index)
router.post("/good/sold", sold.create)
router.get("/good/sold/:id", sold.show)

router.get("/good/income", incomeGood.index)
router.post("/good/income", incomeGood.create)
router.get("/good/income/:id", incomeGood.show)

module.exports = router
