import connectDB from "@/lib/mongodb";
import Grade from "@/models/Grade";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        if (!id) return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });

        const body = await req.json();
        const updatedGrade = await Grade.findByIdAndUpdate(id, body, { new: true, runValidators: true });

        if (!updatedGrade) return NextResponse.json({ success: false, error: "Grade not found" }, { status: 404 });

        return NextResponse.json({ success: true, data: updatedGrade });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        if (!id) return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });

        const deletedGrade = await Grade.findByIdAndDelete(id);

        if (!deletedGrade) return NextResponse.json({ success: false, error: "Grade not found" }, { status: 404 });

        return NextResponse.json({ success: true, data: {} });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
