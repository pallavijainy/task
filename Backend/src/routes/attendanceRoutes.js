const express = require('express');
const { 
  getMyAttendance, 
  punchIn, 
  punchOut,
  getTodayAttendance,
  getTeamAttendance,
  getAllAttendance,
  getAttendanceById,
  validateAttendance
} = require('../controllers/attendanceController');
const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

// Employee routes
router.post(
  "/punch-in",
  protect,
  authorizeRoles("employee"),
  punchIn
);

router.post(
  "/punch-out",
  protect,
  authorizeRoles("employee"),
  punchOut
);

router.get(
  "/my",
  protect,
  authorizeRoles("employee"),
  getMyAttendance
);

router.get(
  "/today",
  protect,
  authorizeRoles("employee"),
  getTodayAttendance
);

// Manager routes
router.get(
  "/team",
  protect,
  authorizeRoles("manager"),
  getTeamAttendance
);

// Admin routes
router.get(
  "/all",
  protect,
  authorizeRoles("admin"),
  getAllAttendance
);

// Manager and Admin routes
router.get(
  "/:id",
  protect,
  authorizeRoles("manager", "admin"),
  getAttendanceById
);

router.patch(
  "/:id/validate",
  protect,
  authorizeRoles("manager", "admin"),
  validateAttendance
);

module.exports = router;
