import connectDB from "@/lib/mongodb";
import Timetable from "@/models/Timetable";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        if (!id) return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });

        const body = await req.json();
        const updatedTimetable = await Timetable.findByIdAndUpdate(id, body, { new: true, runValidators: true });

        if (!updatedTimetable) return NextResponse.json({ success: false, error: "Timetable entry not found" }, { status: 404 });

        return NextResponse.json({ success: true, data: updatedTimetable });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        if (!id) return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });

        const deletedTimetable = await Timetable.findByIdAndDelete(id);

        if (!deletedTimetable) return NextResponse.json({ success: false, error: "Timetable entry not found" }, { status: 404 });

        return NextResponse.json({ success: true, data: {} });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
