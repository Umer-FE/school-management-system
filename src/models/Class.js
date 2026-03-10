import mongoose from "mongoose";

const ClassSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true }, // e.g., "10th Grade"
        sections: [{ type: String }], // e.g., ["A", "B", "C"]
        classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }, // Referencing Teacher model
        status: { type: String, default: "Active" },
    },
    { timestamps: true }
);

export default mongoose.models.Class || mongoose.model("Class", ClassSchema);
