import mongoose from "mongoose";

const TeacherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    subject: { type: String, required: true },
    qualification: { type: String },
    salary: { type: Number, required: true },
    joiningDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["Active", "On Leave", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true },
);

export default mongoose.models.Teacher ||
  mongoose.model("Teacher", TeacherSchema);
