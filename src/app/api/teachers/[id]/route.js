import dbConnect from "@/lib/mongodb";
import Teacher from "@/models/Teacher";
import { NextResponse } from "next/server";

// UPDATE Teacher
export async function PUT(req, { params }) {
  await dbConnect();
  try {
    const { id } = await params;
    const body = await req.json();

    // Use email as unique identifier if provided, fallback to ID
    const query = body.email ? { email: body.email } : { _id: id };

    const updatedTeacher = await Teacher.findOneAndUpdate(query, body, {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true
    });

    return NextResponse.json({ success: true, data: updatedTeacher });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}

// DELETE Teacher
export async function DELETE(req, { params }) {
  await dbConnect();
  try {
    const { id } = await params; // Yahan bhi await zaroori hai
    const deletedTeacher = await Teacher.findByIdAndDelete(id);

    if (!deletedTeacher) {
      return NextResponse.json(
        { success: false, message: "Teacher not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, message: "Teacher deleted" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}
