import dbConnect from "@/lib/mongodb";
import Timetable from "@/models/Timetable";
import Teacher from "@/models/Teacher";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "teacher") {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        // 1. Find teacher ID by email
        const teacher = await Teacher.findOne({ email: session.user.email }).lean();
        if (!teacher) {
            return NextResponse.json({ success: false, error: "Teacher profile not found" }, { status: 404 });
        }

        // 2. Get today's day
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const today = days[new Date().getDay()];

        // 3. Fetch schedule for today
        const schedule = await Timetable.find({
            teacherRef: teacher._id,
            dayOfWeek: today
        })
            .populate("classRef", "name")
            .populate("subjectRef", "name")
            .sort({ startTime: 1 })
            .lean();

        return NextResponse.json({ success: true, data: schedule, day: today });
    } catch (error) {
        console.error("TODAY SCHEDULE ERROR:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 },
        );
    }
}
