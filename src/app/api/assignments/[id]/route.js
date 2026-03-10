import connectDB from "@/lib/mongodb";
import Assignment from "@/models/Assignment";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        if (!id) return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });

        const body = await req.json();
        const updatedAssignment = await Assignment.findByIdAndUpdate(id, body, { new: true, runValidators: true });

        if (!updatedAssignment) return NextResponse.json({ success: false, error: "Assignment not found" }, { status: 404 });

        return NextResponse.json({ success: true, data: updatedAssignment });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        if (!id) return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });

        const deletedAssignment = await Assignment.findByIdAndDelete(id);

        if (!deletedAssignment) return NextResponse.json({ success: false, error: "Assignment not found" }, { status: 404 });

        return NextResponse.json({ success: true, data: {} });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
