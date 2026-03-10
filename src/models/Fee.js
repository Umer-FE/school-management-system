import mongoose from "mongoose";

const FeeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    month: { type: String, required: true }, // Example: "March 2024"
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Paid", "Pending"],
      default: "Pending",
    },
    paymentDate: { type: Date },
  },
  { timestamps: true },
);

export default mongoose.models.Fee || mongoose.model("Fee", FeeSchema);
