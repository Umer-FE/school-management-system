import connectDB from "@/lib/mongodb";
import Student from "@/models/Student";
import Class from "@/models/Class";
import { NextResponse } from "next/server";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// GET: Fetch registered users with 'student' role. Only Admins see all, Students see only themselves.
export async function GET(req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");

    const { role, email } = session.user;

    // 1. Determine query based on role
    let userQuery = { role: "student" };
    let studentQuery = {};

    if (role === "student") {
      userQuery.email = email;
      studentQuery.email = email;
    } else if (role !== "admin" && role !== "staff" && role !== "teacher") {
      // Teachers can now access students too (filtered by classId in the query)
      return NextResponse.json({ success: false, error: "Access Denied" }, { status: 403 });
    }

    // 2. Resolve Class if searching by classId
    let studentQueryWithClass = { ...studentQuery };
    if (classId) {
      if (classId.match(/^[0-9a-fA-F]{24}$/)) {
        // If classId is valid hex string, look up the class name too
        const classObj = await Class.findById(classId).lean();
        if (classObj) {
          studentQueryWithClass.$or = [
            { classId: classId },
            { class: classObj.name }
          ];
        } else {
          studentQueryWithClass.classId = classId;
        }
      } else {
        // Assume classId is a name
        studentQueryWithClass.class = classId;
      }
    }

    // 3. Fetch from Collections
    const registeredUsers = await User.find(userQuery).lean();
    const enrolledStudents = await Student.find(studentQueryWithClass).lean();

    // 3. Robust Merge Logic
    const map = new Map();

    // Initialize with Registered Users (Login accounts)
    registeredUsers.forEach(user => {
      map.set(user.email, {
        _id: user._id,
        userId: user._id,
        name: user.name,
        email: user.email,
        class: "Pending Info",
        phone: "N/A",
        gender: "Unknown",
        status: "Active",
        createdAt: user.createdAt,
        isRegisteredUser: true
      });
    });

    // Merge with Enrolled Data (Academic profile)
    enrolledStudents.forEach(student => {
      if (map.has(student.email)) {
        const existing = map.get(student.email);
        map.set(student.email, {
          ...existing,
          ...student,
          _id: student._id, // Prefer Student model ID for academic operations
          userId: existing._id,
          isProfileCompleted: true
        });
      } else if (role !== "student") {
        // Only add orphan students if we are not in a restricted student view
        // (Though every student should have a User account)
        map.set(student.email, { ...student, isRegisteredUser: false, isProfileCompleted: true });
      }
    });

    let finalStudents = Array.from(map.values());

    // 4. Force filter results if classId was provided (ensures merged results respect the filter)
    if (classId) {
      finalStudents = finalStudents.filter(s => {
        const studentClassId = s.classId?.toString();
        // If the query was by ID, check ID or name
        if (classId.match(/^[0-9a-fA-F]{24}$/)) {
          return studentClassId === classId || s.class === classId || (studentQueryWithClass.$or?.[1]?.class === s.class);
        }
        // If the query was by name, check name
        return s.class === classId;
      });
    }

    finalStudents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return NextResponse.json({ success: true, data: finalStudents });
  } catch (error) {
    console.error("GET STUDENTS ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// POST: Enroll a student or update their academic profile
export async function POST(req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "admin" && session.user.role !== "staff")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    // Check if student record already exists for this email
    let student = await Student.findOne({ email: body.email });

    if (student) {
      // Update existing record
      student = await Student.findOneAndUpdate({ email: body.email }, body, { new: true });
    } else {
      // Create new academic record
      student = await Student.create(body);
    }

    return NextResponse.json(
      { success: true, data: student },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST STUDENT ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}
