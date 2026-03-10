"use client";
import { useState, useEffect } from "react";
import { showSuccess, showError } from "@/lib/swal";

export default function TeacherAttendance() {
  const [teachers, setTeachers] = useState([]);
  const [attData, setAttData] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [tRes, aRes] = await Promise.all([
      fetch("/api/teachers"),
      fetch(`/api/teachers/attendance?date=${date}`),
    ]);
    const teachersList = await tRes.json();
    const attendanceList = await aRes.json();

    if (teachersList.success) {
      setTeachers(teachersList.data);
      const initial = {};
      teachersList.data.forEach((t) => {
        const found = attendanceList.data.find(
          (a) => a.teacherId?._id === t._id,
        );
        initial[t._id] = found ? found.status : "Present";
      });
      setAttData(initial);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [date]);

  const saveAttendance = async () => {
    try {
      const payload = Object.keys(attData).map((id) => ({
        teacherId: id,
        date,
        status: attData[id],
      }));
      const res = await fetch("/api/teachers/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        showSuccess("Saved!", "Staff attendance has been recorded.");
      } else {
        showError("Failed!", "Could not save attendance.");
      }
    } catch (err) {
      showError("Error!", "Something went wrong.");
    }
  };

  return (
    <div className="container-fluid py-4">
      <div
        className="card border-0 shadow-sm p-4 mb-4"
        style={{
          borderRadius: "15px",
          background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
        }}
      >
        <div className="d-flex justify-content-between align-items-center text-white">
          <div>
            <h3 className="fw-bold mb-0">Staff Attendance</h3>
            <p className="mb-0 opacity-75">Mark daily presence for teachers</p>
          </div>
          <input
            type="date"
            className="form-control w-auto border-0 shadow-sm"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div
        className="card border-0 shadow-sm overflow-hidden"
        style={{ borderRadius: "15px" }}
      >
        <table className="table table-hover align-middle mb-0">
          <thead className="bg-light">
            <tr>
              <th className="px-4 py-3">Teacher</th>
              <th>Subject</th>
              <th className="text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t) => (
              <tr key={t._id}>
                <td className="px-4">
                  <div className="fw-bold text-dark">{t.name}</div>
                  <div className="small text-muted">{t.email}</div>
                </td>
                <td>
                  <span className="badge bg-light text-dark">{t.subject}</span>
                </td>
                <td>
                  <div className="d-flex justify-content-center gap-2">
                    {["Present", "Absent", "Leave", "Late"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setAttData({ ...attData, [t._id]: s })}
                        className={`btn btn-sm px-3 rounded-pill fw-bold ${attData[t._id] === s
                            ? s === "Present"
                              ? "btn-success"
                              : s === "Absent"
                                ? "btn-danger"
                                : "btn-warning"
                            : "btn-outline-light text-muted border"
                          }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 bg-light text-end">
          <button
            className="btn btn-primary px-5 fw-bold shadow"
            onClick={saveAttendance}
          >
            Submit Attendance
          </button>
        </div>
      </div>
    </div>
  );
}
