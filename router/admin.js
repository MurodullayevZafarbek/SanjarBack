const { Router } = require("express")
const {
    self,
    editPassword,
    editPhoneNumber,
    dashboard} = require("../controller/admin/admin")
const {
    index,
    show,
    create,
    remove,
    update} = require("../controller/admin/worker")
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

module.exports = router
