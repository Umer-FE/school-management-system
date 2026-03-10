"use client";
import { useState, useEffect } from "react";

export default function TeacherAttendanceHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterDate, setFilterDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // Hum Teacher Attendance ki API use kar rahe hain jo humne pehle banayi thi
      const res = await fetch(`/api/teachers/attendance?date=${filterDate}`);
      const data = await res.json();
      if (data.success) setHistory(data.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filterDate]);

  return (
    <div className="container-fluid py-4">
      {/* Header with Filter */}
      <div
        className="card border-0 shadow-sm p-4 mb-4"
        style={{ borderRadius: "15px", background: "white" }}
      >
        <div className="row align-items-center">
          <div className="col-md-6">
            <h3 className="fw-bold mb-1 text-dark">Staff Attendance History</h3>
            <p className="text-muted small mb-0">
              Review past attendance for all faculty members
            </p>
          </div>
          <div className="col-md-6 d-flex justify-content-md-end gap-2 mt-3 mt-md-0">
            <span className="align-self-center text-muted small fw-bold">
              Select Date:
            </span>
            <input
              type="date"
              className="form-control w-auto shadow-sm border"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Statistics Mini Cards */}
      <div className="row g-3 mb-4 text-center">
        <div className="col-md-3">
          <div
            className="card border-0 shadow-sm p-3 bg-success-subtle text-success"
            style={{ borderRadius: "12px" }}
          >
            <div className="fw-bold">Present</div>
            <h4 className="mb-0">
              {history.filter((h) => h.status === "Present").length}
            </h4>
          </div>
        </div>
        <div className="col-md-3">
          <div
            className="card border-0 shadow-sm p-3 bg-danger-subtle text-danger"
            style={{ borderRadius: "12px" }}
          >
            <div className="fw-bold">Absent</div>
            <h4 className="mb-0">
              {history.filter((h) => h.status === "Absent").length}
            </h4>
          </div>
        </div>
        <div className="col-md-3">
          <div
            className="card border-0 shadow-sm p-3 bg-warning-subtle text-warning"
            style={{ borderRadius: "12px" }}
          >
            <div className="fw-bold">Late / Leave</div>
            <h4 className="mb-0">
              {
                history.filter(
                  (h) => h.status === "Late" || h.status === "Leave",
                ).length
              }
            </h4>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div
        className="card border-0 shadow-sm overflow-hidden"
        style={{ borderRadius: "15px" }}
      >
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-dark text-white">
              <tr>
                <th className="px-4 py-3 border-0">Teacher Name</th>
                <th className="border-0">Department/Subject</th>
                <th className="text-center border-0">Marked Status</th>
                <th className="text-center border-0">Logged Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-5">
                    Loading Staff Records...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-5 text-muted">
                    No attendance found for this date.
                  </td>
                </tr>
              ) : (
                history.map((record, idx) => (
                  <tr key={idx}>
                    <td className="px-4">
                      <div className="fw-bold text-dark">
                        {record.teacherId?.name || "N/A"}
                      </div>
                    </td>
                    <td>
                      <span className="text-muted">
                        {record.teacherId?.subject || "N/A"}
                      </span>
                    </td>
                    <td className="text-center">
                      <span
                        className={`badge px-3 py-2 rounded-pill ${
                          record.status === "Present"
                            ? "bg-success"
                            : record.status === "Absent"
                              ? "bg-danger"
                              : record.status === "Late"
                                ? "bg-info"
                                : "bg-warning text-dark"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="text-center text-muted small">
                      {new Date(record.updatedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
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
