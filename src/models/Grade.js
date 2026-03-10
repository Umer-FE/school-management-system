import mongoose from "mongoose";

const GradeSchema = new mongoose.Schema(
    {
        assignmentRef: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
        studentRef: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
        marksObtained: { type: Number, required: true },
        feedback: { type: String },
    },
    { timestamps: true }
);

export default mongoose.models.Grade || mongoose.model("Grade", GradeSchema);
