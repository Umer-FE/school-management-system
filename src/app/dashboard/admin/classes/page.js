"use client";
import { useState, useEffect } from "react";
import DataTable from "@/components/Atoms/DataTable";
import CustomModal from "@/components/Atoms/CustomModal";
import FormInput from "@/components/Molecules/FormInput";
import { showSuccess, showError, showConfirm } from "@/lib/swal";

export default function ManageClasses() {
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        sections: "",
        classTeacher: "",
        status: "Active",
    });

    const [showStudentModal, setShowStudentModal] = useState(false);
    const [selectedClassName, setSelectedClassName] = useState("");
    const [classStudents, setClassStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [resClasses, resTeachers] = await Promise.all([
                fetch("/api/classes"),
                fetch("/api/teachers"),
            ]);
            const dataClasses = await resClasses.json();
            const dataTeachers = await resTeachers.json();

            if (dataClasses.success) setClasses(dataClasses.data);
            if (dataTeachers.success) setTeachers(dataTeachers.data);
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const viewStudents = async (cls) => {
        setSelectedClassName(cls.name);
        setShowStudentModal(true);
        setLoadingStudents(true);
        try {
            const res = await fetch(`/api/students?classId=${cls._id}`);
            const data = await res.json();
            if (data.success) {
                setClassStudents(data.data);
            }
        } catch (err) {
            console.error("Error fetching students:", err);
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await showConfirm("Are you sure?", "You want to delete this class?");
        if (result.isConfirmed) {
            try {
                const res = await fetch(`/api/classes/${id}`, { method: "DELETE" });
                const data = await res.json();
                if (data.success) {
                    showSuccess("Deleted!", "Class has been deleted.");
                    fetchData();
                } else {
                    showError("Failed!", data.error);
                }
            } catch (err) {
                showError("Error!", "Something went wrong.");
            }
        }
    };

    const handleEdit = (cls) => {
        setEditingId(cls._id);
        setFormData({
            name: cls.name,
            sections: cls.sections ? cls.sections.join(", ") : "",
            classTeacher: cls.classTeacher ? cls.classTeacher._id : "",
            status: cls.status,
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const method = editingId ? "PUT" : "POST";
        const url = editingId ? `/api/classes/${editingId}` : "/api/classes";

        // Convert comma separated string to array safely
        const sectionArray = formData.sections
            ? formData.sections.split(",").map(s => s.trim()).filter(Boolean)
            : [];

        const payload = { ...formData, sections: sectionArray };

        try {
            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await res.json();

            if (res.ok && result.success) {
                showSuccess("Success!", editingId ? "Class Updated! ✅" : "Class Created! 🎉");
                closeModal();
                fetchData();
            } else {
                showError("Failed!", result.error || "Operation failed");
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
        setFormData({ name: "", sections: "", classTeacher: "", status: "Active" });
    };

    const closeStudentModal = () => {
        setShowStudentModal(false);
        setClassStudents([]);
    };

    const teacherOptions = teachers.map(t => ({ value: t._id, label: t.name }));

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-0">Class Management</h2>
                    <p className="text-muted small">Manage classes and sections</p>
                </div>
                <button className="btn btn-primary shadow-sm px-4" onClick={() => setShowModal(true)}>
                    <i className="bi bi-plus-lg me-2"></i> New Class
                </button>
            </div>

            <DataTable
                headers={["Class Name", "Sections", "Class Teacher", "Status", "Actions"]}
                data={classes}
                renderRow={(cls) => (
                    <tr key={cls._id}>
                        <td className="px-4 fw-bold text-primary">{cls.name}</td>
                        <td>{cls.sections?.length > 0 ? cls.sections.join(", ") : "N/A"}</td>
                        <td>{cls.classTeacher ? cls.classTeacher.name : "Unassigned"}</td>
                        <td>
                            <span className={`badge rounded-pill ${cls.status === 'Active' ? 'bg-success' : 'bg-warning'}`}>
                                {cls.status || 'Active'}
                            </span>
                        </td>
                        <td className="text-end px-4">
                            <button className="btn btn-sm btn-info text-white me-2 shadow-sm" onClick={() => viewStudents(cls)} title="View Students">
                                <i className="bi bi-people-fill me-1"></i> Students
                            </button>
                            <button className="btn btn-sm btn-light border me-2" onClick={() => handleEdit(cls)}>
                                <i className="bi bi-pencil"></i>
                            </button>
                            <button className="btn btn-sm btn-light border text-danger" onClick={() => handleDelete(cls._id)}>
                                <i className="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                )}
            />

            {/* NEW: View Students Modal */}
            <CustomModal
                show={showStudentModal}
                title={`Students of ${selectedClassName}`}
                onClose={closeStudentModal}
                size="lg"
            >
                <div className="table-responsive">
                    {loadingStudents ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary" role="status"></div>
                            <p className="mt-2 text-muted">Loading students...</p>
                        </div>
                    ) : classStudents.length > 0 ? (
                        <table className="table table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Student Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {classStudents.map(student => (
                                    <tr key={student._id}>
                                        <td className="fw-bold">{student.name}</td>
                                        <td>{student.email}</td>
                                        <td>{student.phone}</td>
                                        <td>
                                            <span className={`badge rounded-pill ${student.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                                                {student.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-5">
                            <i className="bi bi-people text-muted display-4"></i>
                            <p className="mt-3 text-muted">No students currently enrolled in this class.</p>
                        </div>
                    )}
                </div>
            </CustomModal>

            <CustomModal show={showModal} title={editingId ? "Edit Class Details" : "Create New Class"} onClose={closeModal}>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <FormInput
                            label="Class Name"
                            value={formData.name}
                            required
                            placeholder="e.g. 10th Grade"
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="mb-3">
                        <FormInput
                            label="Sections (Comma separated)"
                            value={formData.sections}
                            placeholder="A, B, C"
                            onChange={(e) => setFormData({ ...formData, sections: e.target.value })}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted">Class Teacher</label>
                        <select
                            className="form-select border-0 bg-light"
                            value={formData.classTeacher}
                            onChange={(e) => setFormData({ ...formData, classTeacher: e.target.value })}
                        >
                            <option value="">-- Select Teacher --</option>
                            {teachers.map(t => (
                                <option key={t._id} value={t._id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4">
                        <FormInput
                            label="Status"
                            type="select"
                            value={formData.status}
                            options={["Active", "Inactive"]}
                            required
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100 fw-bold py-2" disabled={submitting}>
                        {submitting ? "Saving..." : editingId ? "Update Class" : "Create Class"}
                    </button>
                </form>
            </CustomModal>
        </div>
    );
}
