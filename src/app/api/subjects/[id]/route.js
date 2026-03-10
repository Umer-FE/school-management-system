import connectDB from "@/lib/mongodb";
import Subject from "@/models/Subject";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        if (!id) return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });

        const body = await req.json();
        const updatedSubject = await Subject.findByIdAndUpdate(id, body, { new: true, runValidators: true });

        if (!updatedSubject) return NextResponse.json({ success: false, error: "Subject not found" }, { status: 404 });

        return NextResponse.json({ success: true, data: updatedSubject });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        if (!id) return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });

        const deletedSubject = await Subject.findByIdAndDelete(id);

        if (!deletedSubject) return NextResponse.json({ success: false, error: "Subject not found" }, { status: 404 });

        return NextResponse.json({ success: true, data: {} });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
