"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import DataTable from "@/components/Atoms/DataTable";

export default function TeacherTimetable() {
    const { data: session } = useSession();
    const [timetables, setTimetables] = useState([]);
    const [loading, setLoading] = useState(true);

    const dayOrder = {
        "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6, "Sunday": 7
    };

    const fetchData = async () => {
        if (!session?.user?.email) return;
        try {
            setLoading(true);
            const ts = Date.now();
            const res = await fetch(`/api/timetable?ts=${ts}`);
            const data = await res.json();
            if (data.success) {
                const myEmail = session.user.email.toLowerCase();
                const filtered = data.data.filter(t =>
                    t.teacherRef?.email?.toLowerCase() === myEmail
                );

                // Sort by day and time
                const sorted = filtered.sort((a, b) => {
                    const dayDiff = (dayOrder[a.dayOfWeek] || 0) - (dayOrder[b.dayOfWeek] || 0);
                    if (dayDiff !== 0) return dayDiff;
                    return (a.startTime || "").localeCompare(b.startTime || "");
                });

                setTimetables(sorted);
            }
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) fetchData();
    }, [session]);

    return (
        <div className="container-fluid py-4">
            <div className="mb-4">
                <h2 className="fw-bold text-dark mb-0">My Schedule</h2>
                <p className="text-muted small">Your weekly teaching timetable</p>
            </div>

            <DataTable
                headers={["Day", "Time", "Class", "Subject"]}
                data={timetables}
                renderRow={(entry) => (
                    <tr key={entry._id}>
                        <td className="px-4 fw-bold text-primary">{entry.dayOfWeek}</td>
                        <td className="text-muted">{entry.startTime} - {entry.endTime}</td>
                        <td className="fw-bold">{entry.classRef ? entry.classRef.name : "N/A"}</td>
                        <td>{entry.subjectRef ? entry.subjectRef.name : "N/A"}</td>
                    </tr>
                )}
            />
        </div>
    );
}
