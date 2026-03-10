import mongoose from "mongoose";

const SubjectSchema = new mongoose.Schema(
    {
        name: { type: String, required: true }, // e.g., "Mathematics"
        code: { type: String, required: true, unique: true }, // e.g., "MATH101"
        classRef: { type: mongoose.Schema.Types.ObjectId, ref: "Class" }, // Which class this subject belongs to
        teacherRef: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }, // Who teaches it
        status: { type: String, default: "Active" },
    },
    { timestamps: true }
);

export default mongoose.models.Subject || mongoose.model("Subject", SubjectSchema);
