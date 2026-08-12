const express = require('express');
const { 
  getAllUsers,
  getTeamMembers,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

// Manager routes
router.get(
  '/team',
  protect,
  authorizeRoles('manager'),
  getTeamMembers
);

// Admin routes
router.get(
  '/all',
  protect,
  authorizeRoles('admin'),
  getAllUsers
);

router.get(
  '/:id',
  protect,
  authorizeRoles('admin'),
  getUserById
);

router.patch(
  '/:id',
  protect,
  authorizeRoles('admin'),
  updateUser
);

router.delete(
  '/:id',
  protect,
  authorizeRoles('admin'),
  deleteUser
);

module.exports = router;
