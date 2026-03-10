import dbConnect from "@/lib/mongodb";
import TeacherAttendance from "@/models/TeacherAttendance";
import { NextResponse } from "next/server";

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const teacherId = searchParams.get("teacherId");

  try {
    let filter = {};
    if (date) filter.date = date;
    if (teacherId) filter.teacherId = teacherId;

    const attendance = await TeacherAttendance.find(filter).populate(
      "teacherId",
      "name subject",
    );
    return NextResponse.json({ success: true, data: attendance });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}

export async function POST(req) {
  await dbConnect();
  try {
    const body = await req.json(); // Array of records
    const operations = body.map((record) => ({
      updateOne: {
        filter: { teacherId: record.teacherId, date: record.date },
        update: { $set: { status: record.status } },
        upsert: true,
      },
    }));
    await TeacherAttendance.bulkWrite(operations);
    return NextResponse.json({
      success: true,
      message: "Staff attendance updated!",
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
