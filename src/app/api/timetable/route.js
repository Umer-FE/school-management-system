import connectDB from "@/lib/mongodb";
import Timetable from "@/models/Timetable";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const classRef = searchParams.get('classRef');
        const teacherRef = searchParams.get('teacherRef');

        let filter = {};
        if (classRef) filter.classRef = classRef;
        if (teacherRef) filter.teacherRef = teacherRef;

        const timetables = await Timetable.find(filter)
            .populate("classRef", "name")
            .populate("subjectRef", "name")
            .populate("teacherRef", "name email") // Added email
            .sort({ dayOfWeek: 1, startTime: 1 });

        return NextResponse.json({ success: true, data: timetables });
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
        const newTimetable = await Timetable.create(body);
        return NextResponse.json({ success: true, data: newTimetable }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        );
    }
}
