import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Fee from "@/models/Fee";

export async function POST(req) {
  await dbConnect();
  try {
    const body = await req.json();
    const fee = await Fee.create(body);
    return NextResponse.json({ success: true, data: fee });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}

export async function GET() {
  await dbConnect();
  try {
    // .populate('studentId') se humein student ka naam bhi mil jayega
    const fees = await Fee.find().populate("studentId", "name class");
    return NextResponse.json({ success: true, data: fees });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
