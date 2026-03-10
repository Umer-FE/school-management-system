import connectDB from "@/lib/mongodb";
import Grade from "@/models/Grade";
import Student from "@/models/Student";
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
        const assignmentRef = searchParams.get('assignmentRef');
        let studentRef = searchParams.get('studentRef');

        let filter = {};
        if (assignmentRef) filter.assignmentRef = assignmentRef;

        // RBAC: If student, restrict to their own records
        if (role === "student") {
            const studentProfile = await Student.findOne({ email }).lean();
            if (!studentProfile) {
                return NextResponse.json({ success: true, data: [] });
            }
            filter.studentRef = studentProfile._id;
        } else if (studentRef) {
            filter.studentRef = studentRef;
        } else if (role !== "admin" && role !== "staff" && role !== "teacher") {
            return NextResponse.json({ success: false, error: "Access Denied" }, { status: 403 });
        }

        const grades = await Grade.find(filter)
            .populate({
                path: "assignmentRef",
                select: "title totalMarks teacherRef",
                populate: { path: "teacherRef", select: "name email" }
            })
            .populate("studentRef", "name class")
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: grades });
    } catch (error) {
        console.error("GET GRADES ERROR:", error);
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

        if (!session || !["admin", "staff", "teacher"].includes(session.user.role)) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();

        // Check if grade already exists for this student and assignment
        const existingGrade = await Grade.findOne({
            assignmentRef: body.assignmentRef,
            studentRef: body.studentRef
        });

        if (existingGrade) {
            return NextResponse.json(
                { success: false, error: "Grade already exists for this student and assignment" },
                { status: 400 }
            );
        }

        const newGrade = await Grade.create(body);
        return NextResponse.json({ success: true, data: newGrade }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        );
    }
}
