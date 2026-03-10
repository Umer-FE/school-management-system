import connectDB from "@/lib/mongodb";
import Class from "@/models/Class";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        if (!id) return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });

        const body = await req.json();
        const updatedClass = await Class.findByIdAndUpdate(id, body, { new: true, runValidators: true });

        if (!updatedClass) return NextResponse.json({ success: false, error: "Class not found" }, { status: 404 });

        return NextResponse.json({ success: true, data: updatedClass });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        if (!id) return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });

        const deletedClass = await Class.findByIdAndDelete(id);

        if (!deletedClass) return NextResponse.json({ success: false, error: "Class not found" }, { status: 404 });

        return NextResponse.json({ success: true, data: {} });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function GET(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const classObj = await Class.findById(id).lean();
        if (!classObj) return NextResponse.json({ success: false, error: "Class not found" }, { status: 404 });
        return NextResponse.json({ success: true, data: classObj });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
