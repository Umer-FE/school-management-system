"use client";
import { useState, useEffect } from "react";
import DataTable from "@/components/Atoms/DataTable";
import CustomModal from "@/components/Atoms/CustomModal";
import { showSuccess, showError, showConfirm } from "@/lib/swal";

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleData, setScheduleData] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [selectedTeacherForSchedule, setSelectedTeacherForSchedule] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    qualification: "",
    salary: "",
  });

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/teachers");
      const data = await res.json();
      if (data.success) setTeachers(data.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleViewSchedule = async (teacher) => {
    setSelectedTeacherForSchedule(teacher);
    setShowScheduleModal(true);
    setLoadingSchedule(true);
    try {
      const res = await fetch(`/api/timetable?teacherRef=${teacher._id}`);
      const data = await res.json();
      if (data.success) {
        setScheduleData(data.data);
      }
    } catch (error) {
      console.error("Error fetching schedule:", error);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const filteredTeachers = teachers.filter(t =>
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (teacher = null) => {
    if (teacher) {
      setEditMode(true);
      setSelectedId(teacher._id);
      setFormData({
        name: teacher.name || "",
        email: teacher.email || "",
        phone: teacher.phone || "",
        subject: teacher.subject || "",
        qualification: teacher.qualification || "",
        salary: teacher.salary || "",
      });
    } else {
      setEditMode(false);
      setSelectedId(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        qualification: "",
        salary: "",
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editMode ? "PUT" : "POST";
    const url = editMode ? `/api/teachers/${selectedId}` : "/api/teachers";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setShowModal(false);
        fetchTeachers();
        showSuccess(
          "Success!",
          editMode
            ? "Teacher updated successfully! ✅"
            : "Teacher added successfully! 🎉",
        );
      } else {
        showError("Failed!", result.error || "Unknown error");
      }
    } catch (error) {
      console.error("Submission error:", error);
      showError("Error!", "Network error or API path not found.");
    }
  };

  const handleDelete = async (id) => {
    const confirmResult = await showConfirm("Are you sure?", "You want to delete this teacher?");
    if (confirmResult.isConfirmed) {
      try {
        const res = await fetch(`/api/teachers/${id}`, { method: "DELETE" });
        const result = await res.json();

        if (res.ok && result.success) {
          fetchTeachers();
          showSuccess("Deleted!", "Teacher has been deleted.");
        } else {
          showError("Failed!", result.error || "Server error");
        }
      } catch (error) {
        showError("Error!", "Action failed. Please try again.");
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setShowScheduleModal(false);
    setEditMode(false);
    setSelectedId(null);
  };

  return (
    <div className="container-fluid py-4">
      {/* Modern Header Section */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 p-4 bg-white">
        <div className="row align-items-center g-3">
          <div className="col-lg-5">
            <h2 className="fw-bold m-0 text-dark">Teacher Management</h2>
            <p className="text-muted small mb-0">Add, Edit or Remove faculty members</p>
          </div>
          <div className="col-lg-7">
            <div className="d-flex flex-column flex-md-row gap-2 justify-content-lg-end">
              <div className="input-group search-box" style={{ maxWidth: "400px" }}>
                <span className="input-group-text bg-light border-0 rounded-start-pill ps-3">
                  <i className="bi bi-search text-primary"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-0 rounded-end-pill py-2"
                  placeholder="Search by name or subject..."
                  style={{ boxShadow: 'none' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm hover-pull-up"
                onClick={() => handleOpenModal()}
              >
                <i className="bi bi-person-plus-fill me-2"></i>Add Teacher
              </button>
            </div>
          </div>
        </div>
      </div>

      <DataTable
        headers={["Teacher Name", "Subject", "Contact", "Weekly Schedule", "Actions"]}
        data={filteredTeachers}
        renderRow={(t) => (
          <tr key={t._id}>
            <td className="px-4 fw-bold">
              {t.name} <br />
              <small className="text-muted fw-normal">{t.qualification || "No qualification"}</small> <br />
              <small className="text-primary fw-normal">Salary: PKR {t.salary?.toLocaleString() || "N/A"}</small>
            </td>
            <td>
              <span className="badge bg-primary-subtle text-primary">
                {t.subject}
              </span>
            </td>
            <td>
              <div className="small">{t.email}</div>
              <div className="small text-muted">{t.phone}</div>
            </td>
            <td>
              <button
                className="btn btn-sm btn-outline-primary rounded-pill px-3"
                onClick={() => handleViewSchedule(t)}
              >
                <i className="bi bi-calendar3 me-1"></i>View Schedule
              </button>
            </td>
            <td className="text-end px-4">
              <button
                className="btn btn-sm btn-light border me-2"
                onClick={() => handleOpenModal(t)}
              >
                <i className="bi bi-pencil"></i>
              </button>
              <button
                className="btn btn-sm btn-light border text-danger"
                onClick={() => handleDelete(t._id)}
              >
                <i className="bi bi-trash"></i>
              </button>
            </td>
          </tr>
        )}
      />

      {/* Profile/Add/Edit Modal */}
      <CustomModal
        show={showModal}
        title={editMode ? "Edit Teacher" : "Add New Teacher"}
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-bold">Full Name</label>
            <input
              type="text"
              className="form-control bg-light border-0"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-bold">Email (Unique)</label>
            <input
              type="email"
              className="form-control bg-light border-0"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-bold">Phone</label>
              <input
                type="text"
                className="form-control bg-light border-0"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-bold">Subject</label>
              <input
                type="text"
                className="form-control bg-light border-0"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="form-label small fw-bold">Salary (PKR)</label>
            <input
              type="number"
              className="form-control bg-light border-0"
              value={formData.salary}
              onChange={(e) =>
                setFormData({ ...formData, salary: e.target.value })
              }
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100 fw-bold py-2 shadow-sm"
          >
            {editMode ? "Update Changes" : "Save Teacher"}
          </button>
        </form>
      </CustomModal>

      {/* Weekly Schedule Modal */}
      <CustomModal
        show={showScheduleModal}
        title={`Weekly Schedule: ${selectedTeacherForSchedule?.name || ""}`}
        onClose={closeModal}
        size="lg"
      >
        {loadingSchedule ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Fetching schedule...</p>
          </div>
        ) : scheduleData.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-calendar-x display-4 text-muted"></i>
            <p className="mt-2 text-muted">No classes assigned to this teacher.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="bg-light">
                <tr>
                  <th>Day</th>
                  <th>Schedule Detail</th>
                </tr>
              </thead>
              <tbody>
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => {
                  const dayClasses = scheduleData.filter(c => c.dayOfWeek === day);
                  return (
                    <tr key={day}>
                      <td className="fw-bold bg-light-subtle" style={{ width: "120px" }}>{day}</td>
                      <td>
                        {dayClasses.length > 0 ? (
                          <div className="d-flex flex-wrap gap-2">
                            {dayClasses.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((cls, idx) => (
                              <div key={idx} className="p-2 border rounded bg-white shadow-sm" style={{ minWidth: "150px" }}>
                                <div className="small fw-bold text-primary">{cls.startTime} - {cls.endTime}</div>
                                <div className="fw-bold">{cls.subjectRef?.name || cls.subject}</div>
                                <div className="small text-muted">Class: {cls.classRef?.name || cls.class}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted small italic">No classes</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CustomModal>
    </div>
  );
}
