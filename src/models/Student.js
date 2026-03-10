import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  class: { type: String, required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
  gender: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, default: "Active" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Student ||
  mongoose.model("Student", StudentSchema);
