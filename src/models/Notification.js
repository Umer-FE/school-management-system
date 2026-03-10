import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        message: { type: String, required: true },
        audience: {
            type: String,
            enum: ["All", "Teachers", "Students"],
            default: "All"
        },
        sender: { type: String, default: "Admin" }
    },
    { timestamps: true }
);

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
