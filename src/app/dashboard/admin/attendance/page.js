"use client";
import { useState, useEffect } from "react";

export default function AttendancePage() {
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stdRes, attRes] = await Promise.all([
        fetch("/api/students"),
        fetch(`/api/attendance?date=${date}`),
      ]);

      const stdData = await stdRes.json();
      const attData = await attRes.json();

      if (stdData.success) {
        setStudents(stdData.data);
        const initialStatus = {};
        stdData.data.forEach((s) => {
          const existing = attData.data.find((a) => a.studentId?._id === s._id);
          initialStatus[s._id] = existing ? existing.status : "Present";
        });
        setAttendanceData(initialStatus);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [date]);

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

      if (res.ok) alert("Attendance Saved Successfully! ✅");
    } catch (error) {
      alert("Error saving attendance");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="container-fluid py-4"
      style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
    >
      {/* Header Section */}
      <div className="row mb-4 align-items-center">
        <div className="col-md-6">
          <h2 className="fw-bold text-dark mb-1">Daily Attendance</h2>
          <p className="text-muted mb-0">
            Manage and track student presence efficiently
          </p>
        </div>
        <div className="col-md-6 d-flex justify-content-md-end gap-3 mt-3 mt-md-0">
          <div className="input-group shadow-sm" style={{ maxWidth: "250px" }}>
            <span className="input-group-text bg-white border-0">
              <i className="bi bi-calendar3"></i>
            </span>
            <input
              type="date"
              className="form-control border-0"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary px-4 fw-bold shadow-sm d-flex align-items-center gap-2"
            onClick={saveAttendance}
            disabled={saving || loading}
          >
            {saving ? (
              <span className="spinner-border spinner-border-sm"></span>
            ) : (
              <i className="bi bi-check-circle"></i>
            )}
            Save Changes
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      {!loading && (
        <div className="row g-3 mb-4">
          {[
            {
              label: "Present",
              count: "Present",
              color: "success",
              icon: "bi-person-check",
            },
            {
              label: "Absent",
              count: "Absent",
              color: "danger",
              icon: "bi-person-x",
            },
            {
              label: "Leave",
              count: "Leave",
              color: "warning",
              icon: "bi-person-dash",
            },
          ].map((item) => (
            <div className="col-6 col-md-4" key={item.label}>
              <div
                className="card border-0 shadow-sm p-3 d-flex flex-row align-items-center gap-3"
                style={{ borderRadius: "12px" }}
              >
                <div
                  className={`bg-${item.color}-subtle text-${item.color} p-3 rounded-circle d-flex align-items-center`}
                >
                  <i className={`bi ${item.icon} fs-4`}></i>
                </div>
                <div>
                  <h5 className="mb-0 fw-bold">
                    {
                      Object.values(attendanceData).filter(
                        (v) => v === item.count,
                      ).length
                    }
                  </h5>
                  <small className="text-muted fw-semibold">{item.label}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table Section */}
      <div
        className="card border-0 shadow-sm overflow-hidden"
        style={{ borderRadius: "15px" }}
      >
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-white border-bottom text-muted small text-uppercase fw-bold">
              <tr>
                <th className="px-4 py-3">Student Information</th>
                <th className="py-3">Grade</th>
                <th className="py-3 text-center">Mark Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="text-center py-5 text-muted">
                    Loading class list...
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s._id}>
                    <td className="px-4">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold"
                          style={{ width: "40px", height: "40px" }}
                        >
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <div className="fw-bold text-dark">{s.name}</div>
                          <small className="text-muted">
                            ID: {s._id.slice(-6)}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-primary border border-primary-subtle px-3 py-2 rounded-pill">
                        {s.class}
                      </span>
                    </td>
                    <td>
                      <div
                        className="btn-group d-flex justify-content-center mx-auto"
                        style={{ maxWidth: "220px" }}
                      >
                        {[
                          { val: "Present", short: "P", color: "success" },
                          { val: "Absent", short: "A", color: "danger" },
                          { val: "Leave", short: "L", color: "warning" },
                        ].map((btn) => (
                          <button
                            key={btn.val}
                            onClick={() => handleStatusChange(s._id, btn.val)}
                            className={`btn btn-sm fw-bold px-3 py-2 border ${
                              attendanceData[s._id] === btn.val
                                ? `btn-${btn.color} border-${btn.color}`
                                : "btn-outline-light text-muted bg-white"
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
