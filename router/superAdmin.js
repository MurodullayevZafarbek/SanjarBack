const { Router } = require("express")
const router = Router()
const Users = require("../controller/superAdmin/Users")
const Payments = require("../controller/superAdmin/Payments")

// Gel all Admins
router.get("/users", Users.index)
// Gel Special Admin
router.get("/users/:id",Users.show)
// Create a Admin
router.post("/users", Users.create)
// Update a Admin
router.put("/users/:id", Users.update)
// Delete a Admin
router.delete("/users/:id", Users.remove)


// Gel all Payments
router.get("/payments", Payments.index)
// Gel Special Payment
router.get("/payments/:id", Payments.show)
// Create a Payment
router.post("/payments", Payments.create)
// Update a Payment
router.put("/payments/:id", Payments.update)
// Delete a Payment
router.delete("/payments/:id", Payments.remove)


module.exports = router
