import connectDB from "@/lib/mongodb";
import Class from "@/models/Class";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectDB();
        const classes = await Class.find().populate("classTeacher", "name email").sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: classes });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        const newClass = await Class.create(body);
        return NextResponse.json({ success: true, data: newClass }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        );
    }
}
