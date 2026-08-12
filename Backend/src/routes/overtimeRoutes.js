const express = require('express');
const { 
  createOvertimeRequest,
  getMyOvertime,
  getPendingOvertime,
  getAllOvertime,
  approveOvertime,
  rejectOvertime
} = require('../controllers/overtimeController');
const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

// Employee routes
router.post(
  '/',
  protect,
  authorizeRoles('employee'),
  createOvertimeRequest
);

router.get(
  '/my',
  protect,
  authorizeRoles('employee'),
  getMyOvertime
);

// Manager and Admin routes
router.get(
  '/pending',
  protect,
  authorizeRoles('manager', 'admin'),
  getPendingOvertime
);

router.get(
  '/all',
  protect,
  authorizeRoles('manager', 'admin'),
  getAllOvertime
);

router.patch(
  '/:id/approve',
  protect,
  authorizeRoles('manager', 'admin'),
  approveOvertime
);

router.patch(
  '/:id/reject',
  protect,
  authorizeRoles('manager', 'admin'),
  rejectOvertime
);

module.exports = router;
