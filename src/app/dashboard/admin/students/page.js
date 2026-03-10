"use client";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStudents, enrollStudent } from "@/redux/slices/studentSlice";
import FormInput from "@/components/Molecules/FormInput";
import TableSkeleton from "@/components/Molecules/TableSkeleton";
import { showSuccess, showError, showConfirm } from "@/lib/swal";

export default function ManageStudents() {
  const dispatch = useDispatch();
  const {
    list: students,
    loading,
    error,
  } = useSelector((state) => state.students);

  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [classes, setClasses] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    class: "",
    classId: "",
    gender: "",
    phone: "",
  });

  useEffect(() => {
    dispatch(fetchStudents());
    fetch("/api/classes")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setClasses(data.data);
      });
  }, [dispatch]);

  const handleDelete = async (id) => {
    const result = await showConfirm("Are you sure?", "You want to delete this student?");
    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) {
          showSuccess("Deleted!", "Student has been deleted.");
          dispatch(fetchStudents());
        } else {
          showError("Failed!", data.error);
        }
      } catch (err) {
        showError("Error!", "Something went wrong.");
      }
    }
  };

  const handleEdit = (student) => {
    setEditingId(student._id);
    setFormData({
      name: student.name,
      email: student.email,
      class: student.class,
      classId: student.classId || "",
      gender: student.gender,
      phone: student.phone,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingId) {
        const res = await fetch(`/api/students/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const result = await res.json();
        if (res.ok && result.success) {
          showSuccess("Updated!", "Student details updated successfully.");
          closeModal();
          dispatch(fetchStudents());
        } else {
          showError("Failed!", result.error || "Update failed");
        }
      } else {
        const resultAction = await dispatch(enrollStudent(formData));
        if (enrollStudent.fulfilled.match(resultAction)) {
          showSuccess("Enrolled!", "New student enrolled successfully.");
          closeModal();
          dispatch(fetchStudents());
        } else {
          showError("Failed!", resultAction.payload || "Enrollment failed");
        }
      }
    } catch (error) {
      showError("Error!", "Error processing request");
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: "", email: "", class: "", classId: "", gender: "", phone: "" });
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark">Student Management</h2>
          <p className="text-muted">Total Enrolled: {students.length}</p>
        </div>
        <button
          className="btn btn-primary shadow-sm px-4"
          onClick={() => setShowModal(true)}
        >
          <i className="bi bi-plus-lg me-2"></i> New Admission
        </button>
      </div>

      <div className="card border-0 shadow-sm" style={{ borderRadius: "15px" }}>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light text-muted">
                <tr>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="py-3">Class</th>
                  <th className="py-3">Phone</th>
                  <th className="py-3">Status</th>
                  <th className="text-end px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-0">
                      <TableSkeleton rows={5} cols={5} />
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      No students found.
                    </td>
                  </tr>
                ) : (
                  students.map((s) => (
                    <tr key={s.email}>
                      <td className="px-4">
                        <div className="fw-bold">{s.name}</div>
                        <div className="small text-muted">{s.email}</div>
                      </td>
                      <td>
                        <span className="badge bg-primary-subtle text-primary">
                          {s.class}
                        </span>
                      </td>
                      <td className="text-muted small">{s.phone}</td>
                      <td>
                        <span
                          className={`badge ${s.isProfileCompleted ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"}`}
                        >
                          {s.isProfileCompleted ? "Complete" : "Account Only"}
                        </span>
                      </td>
                      <td className="text-end px-4">
                        <button
                          className="btn btn-sm btn-light border me-2"
                          onClick={() => handleEdit(s)}
                          title="Edit Profile"
                        >
                          <i className="bi bi-pencil-square text-primary"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-light border"
                          onClick={() => handleDelete(s._id)}
                          title="Delete"
                        >
                          <i className="bi bi-trash text-danger"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div
              className="modal-content border-0 shadow-lg"
              style={{ borderRadius: "20px" }}
            >
              <div className="modal-header border-0 pt-4 px-4">
                <h5 className="modal-title fw-bold">
                  {editingId ? "Edit Student Details" : "New Student Admission"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <FormInput
                        label="Full Name"
                        value={formData.name}
                        required
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-md-6">
                      <FormInput
                        label="Email"
                        type="email"
                        value={formData.email}
                        required
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-muted text-uppercase">Class</label>
                      <select
                        className="form-select py-2"
                        value={formData.classId}
                        required
                        onChange={(e) => {
                          const selectedClass = classes.find((c) => c._id === e.target.value);
                          setFormData({
                            ...formData,
                            classId: e.target.value,
                            class: selectedClass ? selectedClass.name : "",
                          });
                        }}
                      >
                        <option value="">Select Class</option>
                        {classes.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <FormInput
                        label="Gender"
                        type="select"
                        value={formData.gender}
                        options={["Male", "Female", "Other"]}
                        required
                        onChange={(e) =>
                          setFormData({ ...formData, gender: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-md-12">
                      <FormInput
                        label="Phone"
                        value={formData.phone}
                        required
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pb-4">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-4"
                    disabled={submitting}
                  >
                    {submitting
                      ? "Saving..."
                      : editingId
                        ? "Update Student"
                        : "Enroll Student"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
