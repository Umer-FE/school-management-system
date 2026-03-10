import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const audience = searchParams.get('audience');

        let filter = {};
        if (audience) {
            filter.audience = { $in: ["All", audience] };
        }

        const notifications = await Notification.find(filter).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: notifications });
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
        const newNotification = await Notification.create(body);
        return NextResponse.json({ success: true, data: newNotification }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        );
    }
}
