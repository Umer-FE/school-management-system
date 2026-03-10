import dbConnect from "@/lib/mongodb";
import Teacher from "@/models/Teacher";
import TeacherAttendance from "@/models/TeacherAttendance";
import Payroll from "@/models/Payroll";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");

    if (!month) {
      return NextResponse.json(
        { success: false, error: "Month required" },
        { status: 400 },
      );
    }

    const [year, mm] = month.split("-");

    const teachers = await Teacher.find({ status: "Active" }).lean();
    const existingPayments = await Payroll.find({ month }).lean();

    const payrollData = await Promise.all(
      teachers.map(async (teacher) => {
        const paymentRecord = existingPayments.find(
          (p) => p.teacherId?.toString() === teacher._id.toString(),
        );

        if (paymentRecord) {
          return {
            ...paymentRecord,
            teacherId: { _id: teacher._id, name: teacher.name },
            isAlreadyPaid: true,
          };
        }

        const attendanceRecords = await TeacherAttendance.find({
          teacherId: teacher._id,
          $or: [
            { date: { $regex: new RegExp(month) } },
            { date: { $regex: new RegExp(`^${mm}/.*/${year}`) } },
          ],
        }).lean();

        const absents = attendanceRecords.filter(
          (a) => a.status === "Absent",
        ).length;
        const lates = attendanceRecords.filter(
          (a) => a.status === "Late",
        ).length;

        const baseSalary = teacher.salary || 0;
        const perDay = baseSalary / 30;

        const totalDeductionDays = absents + Math.floor(lates / 3);
        const deductAmount = Math.round(totalDeductionDays * perDay);

        return {
          teacherId: { _id: teacher._id, name: teacher.name },
          baseSalary,
          absents,
          lates,
          attendanceDeduction: deductAmount,
          netSalary: baseSalary - deductAmount,
          manualFine: 0,
          allowances: 0,
          isAlreadyPaid: false,
        };
      }),
    );

    return NextResponse.json({ success: true, data: payrollData });
  } catch (error) {
    console.error("Payroll Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    const payload = Array.isArray(body) ? body : [body];

    const results = await Promise.all(
      payload.map(async (p) => {
        const doc = await Payroll.findOneAndUpdate(
          { teacherId: p.teacherId, month: p.month },
          {
            $set: {
              baseSalary: p.baseSalary,
              absents: p.absents ?? 0,
              attendanceDeduction: p.attendanceDeduction ?? 0,
              manualFine: p.manualFine ?? 0,
              allowances: p.allowances ?? 0,
              netSalary: p.netSalary,
              status: p.status || "Paid",
            },
          },
          { new: true, upsert: true, runValidators: true },
        );
        return doc;
      }),
    );

    return NextResponse.json({
      success: true,
      data: Array.isArray(body) ? results : results[0],
    });
  } catch (error) {
    console.error("Payroll POST Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}
