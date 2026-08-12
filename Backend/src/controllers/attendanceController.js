const Attendance = require("../models/Attendance");
const User = require("../models/User");

exports.punchIn = async (req, res) => {
  try {
    const { selfie, latitude, longitude } = req.body;

    if (!selfie || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "Selfie and location are required",
      });
    }

    // Check for existing active attendance today
    const today = new Date().toISOString().split('T')[0];
    const existingAttendance = await Attendance.findOne({
      employee: req.user._id,
      date: today,
      punchOutTime: null,
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: "You have already punched in today",
      });
    }

    const attendance = await Attendance.create({
      employee: req.user._id,
      date: today,
      punchInTime: new Date(),
      selfie,
      location: {
        latitude: Number(latitude),
        longitude: Number(longitude),
      },
      totalWorkingHours: 0,
      workingStatus: "incomplete",
      validationStatus: "pending",
      overtimeStatus: "none",
    });

    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate("employee", "name email role");

    return res.status(201).json({
      success: true,
      message: "Punch in successful",
      attendance: populatedAttendance,
    });
  } catch (error) {
    console.error("Punch In Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.punchOut = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const attendance = await Attendance.findOne({
      employee: req.user._id,
      date: today,
      punchOutTime: null,
    }).sort({
      punchInTime: -1,
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: "No active punch-in found for today",
      });
    }

    const punchOutTime = new Date();

    attendance.punchOutTime = punchOutTime;

    const workingMilliseconds =
      punchOutTime.getTime() -
      attendance.punchInTime.getTime();

    const workingHours =
      workingMilliseconds / (1000 * 60 * 60);

    attendance.totalWorkingHours = Number(
      workingHours.toFixed(2)
    );

    attendance.workingStatus =
      workingHours >= 8
        ? "completed"
        : "incomplete";

    await attendance.save();

    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate("employee", "name email role");

    return res.status(200).json({
      success: true,
      message: "Punch out successful",
      attendance: populatedAttendance,
    });
  } catch (error) {
    console.error("Punch Out Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getMyAttendance = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 10 } = req.query;

    // Build query
    let query = { employee: req.user._id };

    // Date range filter
    if (startDate || endDate) {
      query.punchInTime = {};
      if (startDate) {
        query.punchInTime.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        query.punchInTime.$lte = endDateTime;
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Attendance.countDocuments(query);

    const attendance = await Attendance.find(query)
      .populate("employee", "name email role")
      .populate("validatedBy", "name email role")
      .sort({ punchInTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      count: attendance.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      attendance,
    });
  } catch (error) {
    console.error("Get Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getTodayAttendance = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const attendance = await Attendance.findOne({
      employee: req.user._id,
      date: today,
    })
      .populate("employee", "name email role")
      .populate("validatedBy", "name email role");

    return res.status(200).json({
      success: true,
      attendance,
    });
  } catch (error) {
    console.error("Get Today Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getTeamAttendance = async (req, res) => {
  try {
    const { startDate, endDate, userId, page = 1, limit = 10 } = req.query;

    // Find all employees managed by this manager
    const teamMembers = await User.find({ 
      managerId: req.user._id,
      role: 'employee'
    }).select('_id');

    const teamMemberIds = teamMembers.map(member => member._id);

    // Build query
    let query = { employee: { $in: teamMemberIds } };

    // User filter (specific employee)
    if (userId && teamMemberIds.map(id => id.toString()).includes(userId)) {
      query.employee = userId;
    }

    // Date range filter
    if (startDate || endDate) {
      query.punchInTime = {};
      if (startDate) {
        query.punchInTime.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        query.punchInTime.$lte = endDateTime;
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Attendance.countDocuments(query);

    const attendance = await Attendance.find(query)
      .populate("employee", "name email role")
      .populate("validatedBy", "name email role")
      .sort({ punchInTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      count: attendance.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      attendance,
    });
  } catch (error) {
    console.error("Get Team Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getAllAttendance = async (req, res) => {
  try {
    const { startDate, endDate, userId, page = 1, limit = 50 } = req.query;

    // Build query
    let query = {};

    // User filter
    if (userId) {
      query.employee = userId;
    }

    // Date range filter
    if (startDate || endDate) {
      query.punchInTime = {};
      if (startDate) {
        query.punchInTime.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        query.punchInTime.$lte = endDateTime;
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Attendance.countDocuments(query);

    const attendance = await Attendance.find(query)
      .populate("employee", "name email role")
      .populate("validatedBy", "name email role")
      .sort({ punchInTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      count: attendance.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      attendance,
    });
  } catch (error) {
    console.error("Get All Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getAttendanceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const attendance = await Attendance.findById(id)
      .populate("employee", "name email role")
      .populate("validatedBy", "name email role");

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found",
      });
    }

    // Check authorization for managers
    if (req.user.role === 'manager') {
      const employee = await User.findById(attendance.employee._id);
      if (!employee || employee.managerId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only view attendance of your team members",
        });
      }
    }

    return res.status(200).json({
      success: true,
      attendance,
    });
  } catch (error) {
    console.error("Get Attendance By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.validateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { validationStatus, validationRemarks } = req.body;

    if (!validationStatus || !['valid', 'invalid'].includes(validationStatus)) {
      return res.status(400).json({
        success: false,
        message: "Valid status is required: 'valid' or 'invalid'",
      });
    }

    const attendance = await Attendance.findById(id)
      .populate("employee", "name email role");

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found",
      });
    }

    // Check authorization for managers
    if (req.user.role === 'manager') {
      const employee = await User.findById(attendance.employee._id);
      if (!employee || employee.managerId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only validate attendance of your team members",
        });
      }
    }

    attendance.validationStatus = validationStatus;
    attendance.validationRemarks = validationRemarks || "";
    attendance.validatedBy = req.user._id;
    attendance.validatedAt = new Date();

    await attendance.save();

    const updatedAttendance = await Attendance.findById(id)
      .populate("employee", "name email role")
      .populate("validatedBy", "name email role");

    return res.status(200).json({
      success: true,
      message: "Attendance validated successfully",
      attendance: updatedAttendance,
    });
  } catch (error) {
    console.error("Validate Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
