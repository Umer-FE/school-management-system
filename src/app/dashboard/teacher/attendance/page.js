"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { showSuccess, showError } from "@/lib/swal";

export default function TeacherAttendancePage() {
    const { data: session, status } = useSession();
    const [students, setStudents] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        if (!session?.user?.email) return;
        try {
            setLoading(true);
            const ts = Date.now();
            const [stdRes, attRes, timetableRes, teachersRes] = await Promise.all([
                fetch(`/api/students?ts=${ts}`),
                fetch(`/api/attendance?date=${date}&ts=${ts}`),
                fetch(`/api/timetable?ts=${ts}`),
                fetch(`/api/teachers?ts=${ts}`),
            ]);

            const stdData = await stdRes.json();
            const attData = await attRes.json();
            const timetableData = await timetableRes.json();
            const teachersData = await teachersRes.json();

            if (stdData.success && teachersData.success && timetableData.success) {
                const myEmail = session.user.email;
                const myProfile = teachersData.data.find(t => t.email === myEmail);

                if (myProfile) {
                    // Find classes taught by this teacher
                    const myClasses = timetableData.data
                        .filter(t => (t.teacherRef?._id || t.teacherRef) === myProfile._id)
                        .map(t => t.classRef?.name)
                        .filter(Boolean);

                    const uniqueClasses = [...new Set(myClasses)];

                    // Filter students belonging to these classes
                    const myStudents = stdData.data.filter(s => uniqueClasses.includes(s.class));

                    setStudents(myStudents);

                    const initialStatus = {};
                    myStudents.forEach((s) => {
                        const existing = attData.data?.find((a) => (a.studentId?._id || a.studentId) === s._id);
                        initialStatus[s._id] = existing ? existing.status : "Present";
                    });
                    setAttendanceData(initialStatus);
                }
            }
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) fetchData();
    }, [date, session]);

    const handleStatusChange = (studentId, status) => {
        setAttendanceData((prev) => ({ ...prev, [studentId]: status }));
    };

    const saveAttendance = async () => {
        try {
            setSaving(true);
            const payload = Object.keys(attendanceData).map((id) => ({
                studentId: id,
                date: date,
                status: attendanceData[id],
            }));

            const res = await fetch("/api/attendance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                showSuccess("Saved!", "Attendance has been recorded successfully.");
            } else {
                showError("Failed!", "Could not save attendance.");
            }
        } catch (error) {
            showError("Error!", "Something went wrong while saving.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container-fluid py-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
            <div className="row mb-4 align-items-center">
                <div className="col-md-6">
                    <h2 className="fw-bold text-dark mb-1">Mark Student Attendance</h2>
                    <p className="text-muted mb-0">Record daily presence for your classes</p>
                </div>
                <div className="col-md-6 d-flex justify-content-md-end gap-3 mt-3 mt-md-0">
                    <div className="input-group shadow-sm" style={{ maxWidth: "250px" }}>
                        <span className="input-group-text bg-white border-0"><i className="bi bi-calendar3"></i></span>
                        <input type="date" className="form-control border-0" value={date} onChange={(e) => setDate(e.target.value)} />
                    </div>
                    <button
                        className="btn btn-primary px-4 fw-bold shadow-sm d-flex align-items-center gap-2"
                        onClick={saveAttendance}
                        disabled={saving || loading}
                    >
                        {saving ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-check-circle"></i>}
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: "15px" }}>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-white border-bottom text-muted small text-uppercase fw-bold">
                            <tr>
                                <th className="px-4 py-3">Student Name</th>
                                <th className="py-3">Class</th>
                                <th className="py-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="3" className="text-center py-5 text-muted">Loading students...</td></tr>
                            ) : (
                                students.map((s) => (
                                    <tr key={s._id}>
                                        <td className="px-4 fw-bold text-dark">{s.name}</td>
                                        <td><span className="badge bg-light text-primary border border-primary-subtle px-3 py-2 rounded-pill">{s.class}</span></td>
                                        <td>
                                            <div className="btn-group d-flex justify-content-center mx-auto" style={{ maxWidth: "220px" }}>
                                                {[
                                                    { val: "Present", short: "P", color: "success" },
                                                    { val: "Absent", short: "A", color: "danger" },
                                                    { val: "Leave", short: "L", color: "warning" },
                                                ].map((btn) => (
                                                    <button
                                                        key={btn.val}
                                                        onClick={() => handleStatusChange(s._id, btn.val)}
                                                        className={`btn btn-sm fw-bold px-3 py-2 border ${attendanceData[s._id] === btn.val ? `btn-${btn.color} border-${btn.color}` : "btn-outline-light text-muted bg-white"
                                                            }`}
                                                    >
                                                        {btn.short}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
