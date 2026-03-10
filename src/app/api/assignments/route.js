import connectDB from "@/lib/mongodb";
import Assignment from "@/models/Assignment";
import Student from "@/models/Student";
import Class from "@/models/Class";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { role, email } = session.user;
        const { searchParams } = new URL(req.url);
        let classRef = searchParams.get('classRef');
        let teacherRef = searchParams.get('teacherRef');

        let filter = {};

        // RBAC: If student, only show assignments for their class
        if (role === "student") {
            const studentProfile = await Student.findOne({ email }).lean();
            if (!studentProfile) {
                return NextResponse.json({ success: true, data: [] });
            }

            // Find the Class ID that matches the student's class name string
            const classObj = await Class.findOne({ name: studentProfile.class }).lean();
            if (!classObj) {
                return NextResponse.json({ success: true, data: [] });
            }
            filter.classRef = classObj._id;
        } else {
            // Admin/Teacher can filter
            if (classRef) filter.classRef = classRef;
            if (teacherRef) filter.teacherRef = teacherRef;

            // If teacher, they should only see their own assignments unless specified otherwise
            if (role === "teacher" && !teacherRef) {
                // We'd need to find the teacher profile by email to get their _id
                // For now, let's keep it open for teachers if they don't filter
            }
        }

        const assignments = await Assignment.find(filter)
            .populate("classRef", "name")
            .populate("subjectRef", "name")
            .populate("teacherRef", "name email")
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: assignments });
    } catch (error) {
        console.error("GET ASSIGNMENTS ERROR:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        // Only Admin, Staff, and Teachers can create assignments
        if (!session || !["admin", "staff", "teacher"].includes(session.user.role)) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const newAssignment = await Assignment.create(body);
        return NextResponse.json({ success: true, data: newAssignment }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        );
    }
}
