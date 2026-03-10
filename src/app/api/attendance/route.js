import dbConnect from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Student from "@/models/Student";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { role, email } = session.user;
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    let studentId = searchParams.get("studentId");

    let filter = {};
    if (date) filter.date = date;

    // RBAC: If student, restrict to their own records
    if (role === "student") {
      // Find the Student ID from email first
      const studentProfile = await Student.findOne({ email }).lean();
      if (!studentProfile) {
        return NextResponse.json({ success: true, data: [] }); // No profile, no attendance
      }
      filter.studentId = studentProfile._id;
    } else if (studentId) {
      // Admin/Teacher can filter by studentId
      filter.studentId = studentId;
    } else if (role !== "admin" && role !== "staff") {
      // Teachers without a specific studentId might need class-based filtering later
      return NextResponse.json({ success: false, error: "Access Denied" }, { status: 403 });
    }

    const attendance = await Attendance.find(filter).populate(
      "studentId",
      "name class"
    );

    return NextResponse.json({ success: true, data: attendance });
  } catch (error) {
    console.error("GET ATTENDANCE ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    // Only Admin, Staff, and Teachers can post attendance
    if (!session || !["admin", "staff", "teacher"].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json(); // Array: [{studentId, date, status}, ...]

    const operations = body.map((record) => ({
      updateOne: {
        filter: { studentId: record.studentId, date: record.date },
        update: { $set: { status: record.status } },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(operations);
    return NextResponse.json({ success: true, message: "Attendance updated!" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}
