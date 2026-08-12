const User = require("../models/User");

exports.getAllUsers = async (req, res) => {
  try {
    // Admin should see only Employees and Managers (NOT other Admins)
    const users = await User.find({ 
      role: { $in: ['employee', 'manager'] } 
    })
      .select("-password")
      .sort({ role: 1, name: 1 }); // Sort by role first, then name

    // Separate users by role for frontend display
    const employees = users.filter(user => user.role === 'employee');
    const managers = users.filter(user => user.role === 'manager');

    return res.status(200).json({
      success: true,
      count: users.length,
      users, // All non-admin users
      employees, // Only employees
      managers, // Only managers
      employeeCount: employees.length,
      managerCount: managers.length,
    });
  } catch (error) {
    console.error("Get All Users Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getTeamMembers = async (req, res) => {
  try {
    // Manager should see only Employees (NOT Admins or other Managers)
    const teamMembers = await User.find({ 
      role: 'employee' // Only employees
    })
      .select("-password")
      .sort({ name: 1 }); // Sort by name

    return res.status(200).json({
      success: true,
      count: teamMembers.length,
      users: teamMembers,
      employees: teamMembers, // Alias for consistency
    });
  } catch (error) {
    console.error("Get Team Members Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select("-password")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get User By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;

    await user.save();

    const updatedUser = await User.findById(id)
      .select("-password")

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
