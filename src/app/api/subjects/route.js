import connectDB from "@/lib/mongodb";
import Subject from "@/models/Subject";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectDB();
        const subjects = await Subject.find()
            .populate("classRef", "name")
            .populate("teacherRef", "name email")
            .sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: subjects });
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
        const newSubject = await Subject.create(body);
        return NextResponse.json({ success: true, data: newSubject }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        );
    }
}
