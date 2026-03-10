import mongoose from "mongoose";

const PayrollSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    month: { type: String, required: true }, // e.g., "2026-03"
    baseSalary: { type: Number, required: true },
    absents: { type: Number, default: 0 },
    attendanceDeduction: { type: Number, default: 0 },
    manualFine: { type: Number, default: 0 },
    allowances: { type: Number, default: 0 },
    netSalary: { type: Number, required: true },
    status: { type: String, enum: ["Paid", "Pending"], default: "Paid" },
  },
  { timestamps: true },
);

export default mongoose.models.Payroll ||
  mongoose.model("Payroll", PayrollSchema);
