import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Student from "@/models/Student";

// 1. UPDATE STUDENT
export async function PUT(req, { params }) {
  await dbConnect();
  try {
    // Next.js naye versions mein params ko await karna zaroori hai
    const { id } = await params;
    const body = await req.json();

    // Since registered users might not exist in the Student collection yet,
    // we use their email (from body) as the primary match, or fallback to the provided ID.
    const query = body.email ? { email: body.email } : { _id: id };

    const updated = await Student.findOneAndUpdate(query, body, {
      new: true,
      upsert: true, 
      runValidators: true,
      setDefaultsOnInsert: true
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 },
    );
  }
}

// 2. DELETE STUDENT
export async function DELETE(req, { params }) {
  await dbConnect();
  try {
    const { id } = await params; 

    const deleted = await Student.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 },
    );
  }
}
