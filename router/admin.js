const { Router } = require("express")
const {
    self,
    editPassword,
    editPhoneNumber,
    dashboard } = require("../controller/admin/admin")
const {
    index,
    show,
    create,
    remove,
    update } = require("../controller/admin/worker")
const sold = require("../controller/admin/sold")
const statistic = require("../controller/admin/statistics")
const router = Router()

router.get("/", dashboard)
router.get("/self", self)
router.put("/self/edit/password", editPassword)
router.put("/self/edit/phoneNumber", editPhoneNumber)

router.get("/workers", index)
router.get("/workers/:id", show)
router.post("/workers", create)
router.put("/workers/:id", update)
router.delete("/workers/:id", remove)

router.get("/good/sold", sold.index)
router.get("/good/sold/:id", sold.show)

router.get("/statistic/today", statistic.today)
router.get("/statistic1", statistic.soldStatistic)
module.exports = router
