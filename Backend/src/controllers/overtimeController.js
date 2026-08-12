const Overtime = require("../models/Overtime");
const Attendance = require("../models/Attendance");
const User = require("../models/User");

exports.createOvertimeRequest = async (req, res) => {
  try {
    const { attendanceId, hours, reason } = req.body;

    if (!attendanceId || !hours || !reason) {
      return res.status(400).json({
        success: false,
        message: "Attendance ID, hours, and reason are required",
      });
    }

    if (hours <= 0) {
      return res.status(400).json({
        success: false,
        message: "Hours must be greater than 0",
      });
    }

    const attendance = await Attendance.findById(attendanceId);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    if (attendance.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only request overtime for your own attendance",
      });
    }

    if (!attendance.punchOutTime) {
      return res.status(400).json({
        success: false,
        message: "Cannot request overtime for incomplete attendance",
      });
    }

    // Check if overtime already requested for this attendance
    const existingOvertime = await Overtime.findOne({ 
      attendance: attendanceId 
    });

    if (existingOvertime) {
      return res.status(400).json({
        success: false,
        message: "Overtime already requested for this attendance",
      });
    }

    const overtime = await Overtime.create({
      employee: req.user._id,
      attendance: attendanceId,
      hours: Number(hours),
      reason,
      status: "pending",
    });

    // Update attendance overtime status
    attendance.overtimeStatus = "pending";
    await attendance.save();

    const populatedOvertime = await Overtime.findById(overtime._id)
      .populate("employee", "name email role")
      .populate("attendance")
      .populate("approvedBy", "name email role");

    return res.status(201).json({
      success: true,
      message: "Overtime request created successfully",
      overtime: populatedOvertime,
    });
  } catch (error) {
    console.error("Create Overtime Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getMyOvertime = async (req, res) => {
  try {
    const overtime = await Overtime.find({
      employee: req.user._id,
    })
      .populate("employee", "name email role")
      .populate("attendance")
      .populate("approvedBy", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: overtime.length,
      overtime,
    });
  } catch (error) {
    console.error("Get My Overtime Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getPendingOvertime = async (req, res) => {
  try {
    let query = { status: "pending" };

    // If manager, only show their team's overtime
    if (req.user.role === 'manager') {
      const teamMembers = await User.find({ 
        managerId: req.user._id,
        role: 'employee'
      }).select('_id');

      const teamMemberIds = teamMembers.map(member => member._id);
      query.employee = { $in: teamMemberIds };
    }

    const overtime = await Overtime.find(query)
      .populate("employee", "name email role")
      .populate("attendance")
      .populate("approvedBy", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: overtime.length,
      overtime,
    });
  } catch (error) {
    console.error("Get Pending Overtime Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getAllOvertime = async (req, res) => {
  try {
    let query = {};

    // If manager, only show their team's overtime
    if (req.user.role === 'manager') {
      const teamMembers = await User.find({ 
        managerId: req.user._id,
        role: 'employee'
      }).select('_id');

      const teamMemberIds = teamMembers.map(member => member._id);
      query.employee = { $in: teamMemberIds };
    }

    const overtime = await Overtime.find(query)
      .populate("employee", "name email role")
      .populate("attendance")
      .populate("approvedBy", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: overtime.length,
      overtime,
    });
  } catch (error) {
    console.error("Get All Overtime Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.approveOvertime = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const overtime = await Overtime.findById(id)
      .populate("employee", "name email role");

    if (!overtime) {
      return res.status(404).json({
        success: false,
        message: "Overtime request not found",
      });
    }

    if (overtime.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This overtime request has already been processed",
      });
    }

    // Check authorization for managers
    if (req.user.role === 'manager') {
      const employee = await User.findById(overtime.employee._id);
      if (!employee || employee.managerId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only approve overtime for your team members",
        });
      }
    }

    overtime.status = "approved";
    overtime.remarks = remarks || "";
    overtime.approvedBy = req.user._id;
    overtime.approvedAt = new Date();

    await overtime.save();

    // Update attendance overtime status
    const attendance = await Attendance.findById(overtime.attendance);
    if (attendance) {
      attendance.overtimeStatus = "approved";
      await attendance.save();
    }

    const updatedOvertime = await Overtime.findById(id)
      .populate("employee", "name email role")
      .populate("attendance")
      .populate("approvedBy", "name email role");

    return res.status(200).json({
      success: true,
      message: "Overtime approved successfully",
      overtime: updatedOvertime,
    });
  } catch (error) {
    console.error("Approve Overtime Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.rejectOvertime = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    if (!remarks) {
      return res.status(400).json({
        success: false,
        message: "Remarks are required when rejecting overtime",
      });
    }

    const overtime = await Overtime.findById(id)
      .populate("employee", "name email role");

    if (!overtime) {
      return res.status(404).json({
        success: false,
        message: "Overtime request not found",
      });
    }

    if (overtime.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This overtime request has already been processed",
      });
    }

    // Check authorization for managers
    if (req.user.role === 'manager') {
      const employee = await User.findById(overtime.employee._id);
      if (!employee || employee.managerId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only reject overtime for your team members",
        });
      }
    }

    overtime.status = "rejected";
    overtime.remarks = remarks;
    overtime.approvedBy = req.user._id;
    overtime.approvedAt = new Date();

    await overtime.save();

    // Update attendance overtime status
    const attendance = await Attendance.findById(overtime.attendance);
    if (attendance) {
      attendance.overtimeStatus = "rejected";
      await attendance.save();
    }

    const updatedOvertime = await Overtime.findById(id)
      .populate("employee", "name email role")
      .populate("attendance")
      .populate("approvedBy", "name email role");

    return res.status(200).json({
      success: true,
      message: "Overtime rejected successfully",
      overtime: updatedOvertime,
    });
  } catch (error) {
    console.error("Reject Overtime Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
