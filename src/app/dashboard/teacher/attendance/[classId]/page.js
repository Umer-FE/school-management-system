"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect, use } from "react";
import { showSuccess, showError } from "@/lib/swal";

export default function ClassAttendancePage({ params }) {
    const { classId } = use(params);
    const { data: session } = useSession();
    const [students, setStudents] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [className, setClassName] = useState("");

    const fetchData = async () => {
        if (!session?.user?.email) return;
        try {
            setLoading(true);
            const ts = Date.now();
            const [stdRes, attRes, classRes] = await Promise.all([
                fetch(`/api/students?classId=${classId}&ts=${ts}`),
                fetch(`/api/attendance?date=${date}&ts=${ts}`),
                fetch(`/api/classes/${classId}?ts=${ts}`),
            ]);

            const stdData = await stdRes.json();
            const attData = await attRes.json();
            const classData = await classRes.json();

            if (classData.success) {
                setClassName(classData.data.name);
            }

            if (stdData.success) {
                setStudents(stdData.data);

                const initialStatus = {};
                stdData.data.forEach((s) => {
                    const existing = attData.data?.find((a) => (a.studentId?._id || a.studentId) === s._id);
                    initialStatus[s._id] = existing ? existing.status : "Present";
                });
                setAttendanceData(initialStatus);
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            toast.error("Failed to load attendance data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) fetchData();
    }, [date, session, classId]);

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

            const data = await res.json();
            if (data.success) {
                showSuccess("Saved!", "Attendance recorded for this class.");
            } else {
                showError("Failed!", data.error || "Error saving attendance");
            }
        } catch (error) {
            showError("Error!", "Error saving attendance");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container-fluid py-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
            <div className="row mb-4 align-items-center">
                <div className="col-md-6">
                    <h2 className="fw-bold text-dark mb-1">
                        Attendance: {className || "Class"}
                    </h2>
                    <p className="text-muted mb-0">Record daily presence for this class</p>
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
                                <th className="py-3">Email/ID</th>
                                <th className="py-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="3" className="text-center py-5 text-muted">Loading students...</td></tr>
                            ) : students.length === 0 ? (
                                <tr><td colSpan="3" className="text-center py-5 text-muted">No students found in this class.</td></tr>
                            ) : (
                                students.map((s) => (
                                    <tr key={s._id}>
                                        <td className="px-4 fw-bold text-dark">{s.name}</td>
                                        <td><span className="text-muted small">{s.email}</span></td>
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
