"use client";
import { useState, useEffect } from "react";
import DataTable from "@/components/Atoms/DataTable";

export default function StudentTimetable() {
    const [timetables, setTimetables] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            // In a real app we'd filter by student's classRef
            const res = await fetch("/api/timetable");
            const data = await res.json();
            if (data.success) setTimetables(data.data);
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="container-fluid py-4">
            <div className="mb-4">
                <h2 className="fw-bold text-dark mb-0">My Timetable</h2>
                <p className="text-muted small">Your weekly class schedule</p>
            </div>

            <DataTable
                headers={["Day", "Time", "Subject", "Teacher"]}
                data={timetables}
                renderRow={(entry) => (
                    <tr key={entry._id}>
                        <td className="px-4 fw-bold text-primary">{entry.dayOfWeek}</td>
                        <td className="text-muted">{entry.startTime} - {entry.endTime}</td>
                        <td className="fw-bold">{entry.subjectRef ? entry.subjectRef.name : "N/A"}</td>
                        <td>{entry.teacherRef ? entry.teacherRef.name : "N/A"}</td>
                    </tr>
                )}
            />
        </div>
    );
}
