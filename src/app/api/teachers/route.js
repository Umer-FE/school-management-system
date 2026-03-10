import dbConnect from "@/lib/mongodb";
import Teacher from "@/models/Teacher";
import { NextResponse } from "next/server";

import User from "@/models/User";

export async function GET() {
  await dbConnect();
  try {
    const enrolledTeachers = await Teacher.find({}).lean();
    const registeredUsers = await User.find({ role: "teacher" }).lean();

    const map = new Map();

    registeredUsers.forEach(user => {
      map.set(user.email, {
        _id: user._id,
        name: user.name,
        email: user.email,
        subject: "Unassigned",
        phone: "N/A",
        status: "Active",
        createdAt: user.createdAt,
        isRegisteredUser: true
      });
    });

    enrolledTeachers.forEach(teacher => {
      if (map.has(teacher.email)) {
        const existing = map.get(teacher.email);
        map.set(teacher.email, { ...existing, ...teacher, isRegisteredUser: true });
      } else {
        map.set(teacher.email, { ...teacher, isRegisteredUser: false });
      }
    });

    const finalTeachers = Array.from(map.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return NextResponse.json({ success: true, data: finalTeachers });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}

export async function POST(req) {
  await dbConnect();
  try {
    const body = await req.json();
    const teacher = await Teacher.create(body);
    return NextResponse.json({ success: true, data: teacher });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}
