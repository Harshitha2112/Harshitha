const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleBanUser,
  deleteUser,
  getAnalytics,
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

// All routes below require ADMIN role
router.use(protect, authorizeRoles("ADMIN"));

router.get("/", getAllUsers);
router.get("/analytics", getAnalytics);
router.get("/:id", getUserById);
router.put("/:id/role", updateUserRole);
router.put("/:id/ban", toggleBanUser);
router.delete("/:id", deleteUser);

module.exports = router;
