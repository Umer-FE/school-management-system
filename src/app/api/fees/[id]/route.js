import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Fee from "@/models/Fee";

// Update a single fee record
export async function PUT(req, { params }) {
  await dbConnect();
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await Fee.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).populate("studentId", "name class");

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Fee record not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}

// Delete a single fee record
export async function DELETE(req, { params }) {
  await dbConnect();
  try {
    const { id } = await params;

    const deleted = await Fee.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Fee record not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Fee record deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}

