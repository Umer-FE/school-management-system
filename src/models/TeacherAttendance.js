import mongoose from "mongoose";

const TeacherAttendanceSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "Leave", "Late"],
      default: "Present",
    },
    remarks: { type: String },
  },
  { timestamps: true },
);

TeacherAttendanceSchema.index({ teacherId: 1, date: 1 }, { unique: true });

export default mongoose.models.TeacherAttendance ||
  mongoose.model("TeacherAttendance", TeacherAttendanceSchema);
