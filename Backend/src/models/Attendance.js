const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    punchInTime: {
      type: Date,
      required: true,
    },

    punchOutTime: {
      type: Date,
    },

    selfie: {
      type: String,
      required: true,
    },

    location: {
      latitude: {
        type: Number,
        required: true,
      },

      longitude: {
        type: Number,
        required: true,
      },
    },

    totalWorkingHours: {
      type: Number,
      default: 0,
    },

    workingStatus: {
      type: String,
      enum: ["incomplete", "completed"],
      default: "incomplete",
    },

    validationStatus: {
      type: String,
      enum: ["pending", "valid", "invalid"],
      default: "pending",
    },

    validationRemarks: {
      type: String,
      default: "",
    },

    validatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    validatedAt: {
      type: Date,
    },

    overtimeStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },

    date: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index({ employee: 1, date: 1 });

module.exports = mongoose.model("Attendance", attendanceSchema);