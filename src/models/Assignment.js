import mongoose from "mongoose";

const AssignmentSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        classRef: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
        subjectRef: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
        teacherRef: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
        dueDate: { type: Date, required: true },
        totalMarks: { type: Number, default: 100 },
    },
    { timestamps: true }
);

export default mongoose.models.Assignment || mongoose.model("Assignment", AssignmentSchema);
