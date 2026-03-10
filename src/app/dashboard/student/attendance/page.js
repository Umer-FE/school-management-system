"use client";
import { useState, useEffect } from "react";
import DataTable from "@/components/Atoms/DataTable";

export default function StudentAttendanceView() {
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            // In a real app we'd filter by the current student ID: `?studentId=${session.user.id}`
            // For demo, we just get all for the current date or all history
            // The API currently supports `?studentId=` but we might not have the ID here.
            // So let's just fetch all and show them for demo
            const res = await fetch("/api/attendance");
            const data = await res.json();

            if (data.success) {
                setAttendanceRecords(data.data);
            }
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Compute stats
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter(a => a.status === "Present").length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return (
        <div className="container-fluid py-4">
            <div className="row mb-4">
                <div className="col-md-8">
                    <h2 className="fw-bold text-dark mb-0">My Attendance</h2>
                    <p className="text-muted small">View your day-to-day presence</p>
                </div>
                <div className="col-md-4 text-end">
                    <div className="d-inline-block bg-white px-4 py-2 rounded-pill shadow-sm border border-light">
                        <span className="text-muted me-2 small fw-bold">Overall Attendance:</span>
                        <span className={`fw-bold ${percentage >= 75 ? 'text-success' : 'text-danger'}`} style={{ fontSize: '1.1rem' }}>
                            {percentage}%
                        </span>
                    </div>
                </div>
            </div>

            <DataTable
                headers={["Date", "Status"]}
                data={attendanceRecords}
                renderRow={(entry) => (
                    <tr key={entry._id}>
                        <td className="px-4 fw-bold">{new Date(entry.date).toLocaleDateString()}</td>
                        <td>
                            <span className={`badge rounded-pill ${entry.status === 'Present' ? 'bg-success' :
                                    entry.status === 'Absent' ? 'bg-danger' : 'bg-warning'
                                }`}>
                                {entry.status}
                            </span>
                        </td>
                    </tr>
                )}
            />
        </div>
    );
}
