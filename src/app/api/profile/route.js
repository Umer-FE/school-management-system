import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Teacher from "@/models/Teacher";
import Student from "@/models/Student";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { email, role } = session.user;

        const user = await User.findOne({ email }).select("-password").lean();
        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        let extraInfo = null;
        if (role === "teacher") {
            extraInfo = await Teacher.findOne({ email }).lean();
        } else if (role === "student") {
            extraInfo = await Student.findOne({ email }).populate("classId").lean();
        }

        return NextResponse.json({
            success: true,
            data: {
                ...user,
                profile: extraInfo
            }
        });

    } catch (error) {
        console.error("PROFILE API GET ERROR:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { email, role } = session.user;
        const body = await req.json();

        // Check if it's a password update
        if (body.currentPassword && body.newPassword) {
            const user = await User.findOne({ email });
            if (!user) {
                return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
            }

            const isMatch = await bcrypt.compare(body.currentPassword, user.password);
            if (!isMatch) {
                return NextResponse.json({ success: false, error: "Current password does not match" }, { status: 400 });
            }

            const hashedPassword = await bcrypt.hash(body.newPassword, 10);
            user.password = hashedPassword;
            await user.save();

            return NextResponse.json({ success: true, message: "Password updated successfully" });
        }

        // 1. Update User model (Mainly Name and Image)
        const userUpdate = {};
        if (body.name) userUpdate.name = body.name;
        if (body.image) userUpdate.image = body.image;

        const updatedUser = await User.findOneAndUpdate(
            { email },
            { $set: userUpdate },
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        // 2. Update Role-specific model
        let updatedProfile = null;
        const profileUpdate = {};
        if (body.name) profileUpdate.name = body.name;
        if (body.phone) profileUpdate.phone = body.phone;

        if (role === "teacher") {
            if (body.qualification) profileUpdate.qualification = body.qualification;
            updatedProfile = await Teacher.findOneAndUpdate(
                { email },
                { $set: profileUpdate },
                { new: true }
            );
        } else if (role === "student") {
            if (body.gender) profileUpdate.gender = body.gender;
            updatedProfile = await Student.findOneAndUpdate(
                { email },
                { $set: profileUpdate },
                { new: true }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                ...updatedUser.toObject(),
                profile: updatedProfile
            }
        });

    } catch (error) {
        console.error("PROFILE API PUT ERROR:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
