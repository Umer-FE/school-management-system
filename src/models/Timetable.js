import mongoose from "mongoose";

const TimetableSchema = new mongoose.Schema(
    {
        classRef: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
        subjectRef: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
        teacherRef: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
        dayOfWeek: {
            type: String,
            enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            required: true
        },
        startTime: { type: String, required: true }, // e.g. "09:00"
        endTime: { type: String, required: true },   // e.g. "10:00"
    },
    { timestamps: true }
);

export default mongoose.models.Timetable || mongoose.model("Timetable", TimetableSchema);
