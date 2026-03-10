"use client";
import { useState, useEffect } from "react";
import DataTable from "@/components/Atoms/DataTable";
import CustomModal from "@/components/Atoms/CustomModal";
import FormInput from "@/components/Molecules/FormInput";
import { showSuccess, showError, showConfirm } from "@/lib/swal";

export default function ManageSubjects() {
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        code: "",
        classRef: "",
        teacherRef: "",
        status: "Active",
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [resSubjects, resClasses, resTeachers] = await Promise.all([
                fetch("/api/subjects"),
                fetch("/api/classes"),
                fetch("/api/teachers"),
            ]);
            const dataSubjects = await resSubjects.json();
            const dataClasses = await resClasses.json();
            const dataTeachers = await resTeachers.json();

            if (dataSubjects.success) setSubjects(dataSubjects.data);
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

    const handleDelete = async (id) => {
        const confirmResult = await showConfirm("Are you sure?", "You want to delete this subject?");
        if (confirmResult.isConfirmed) {
            try {
                const res = await fetch(`/api/subjects/${id}`, { method: "DELETE" });
                const data = await res.json();
                if (data.success) {
                    showSuccess("Deleted!", "Subject has been deleted.");
                    fetchData();
                } else {
                    showError("Failed!", data.error);
                }
            } catch (err) {
                showError("Error!", "Something went wrong.");
            }
        }
    };

    const handleEdit = (subject) => {
        setEditingId(subject._id);
        setFormData({
            name: subject.name,
            code: subject.code,
            classRef: subject.classRef ? subject.classRef._id : "",
            teacherRef: subject.teacherRef ? subject.teacherRef._id : "",
            status: subject.status,
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const method = editingId ? "PUT" : "POST";
        const url = editingId ? `/api/subjects/${editingId}` : "/api/subjects";

        try {
            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await res.json();

            if (res.ok && result.success) {
                showSuccess("Success!", editingId ? "Subject Updated! ✅" : "Subject Created! 🎉");
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
        setFormData({ name: "", code: "", classRef: "", teacherRef: "", status: "Active" });
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-0">Subject Management</h2>
                    <p className="text-muted small">Manage subjects and course details</p>
                </div>
                <button className="btn btn-primary shadow-sm px-4" onClick={() => setShowModal(true)}>
                    <i className="bi bi-plus-lg me-2"></i> Add Subject
                </button>
            </div>

            <DataTable
                headers={["Subject", "Code", "Class", "Teacher", "Status", "Actions"]}
                data={subjects}
                renderRow={(subj) => (
                    <tr key={subj._id}>
                        <td className="px-4 fw-bold">{subj.name}</td>
                        <td className="text-muted">{subj.code}</td>
                        <td>{subj.classRef ? subj.classRef.name : "Unassigned"}</td>
                        <td>{subj.teacherRef ? subj.teacherRef.name : "Unassigned"}</td>
                        <td>
                            <span className={`badge rounded-pill ${subj.status === 'Active' ? 'bg-success' : 'bg-warning'}`}>
                                {subj.status || 'Active'}
                            </span>
                        </td>
                        <td className="text-end px-4">
                            <button className="btn btn-sm btn-light border me-2" onClick={() => handleEdit(subj)}>
                                <i className="bi bi-pencil"></i>
                            </button>
                            <button className="btn btn-sm btn-light border text-danger" onClick={() => handleDelete(subj._id)}>
                                <i className="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                )}
            />

            <CustomModal show={showModal} title={editingId ? "Edit Subject" : "Add New Subject"} onClose={closeModal}>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <FormInput
                            label="Subject Name"
                            value={formData.name}
                            required
                            placeholder="e.g. Mathematics"
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="mb-3">
                        <FormInput
                            label="Subject Code"
                            value={formData.code}
                            required
                            placeholder="e.g. MATH101"
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted">Belongs To Class</label>
                        <select
                            className="form-select border-0 bg-light"
                            value={formData.classRef}
                            onChange={(e) => setFormData({ ...formData, classRef: e.target.value })}
                            required
                        >
                            <option value="">-- Select Class --</option>
                            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted">Subject Teacher</label>
                        <select
                            className="form-select border-0 bg-light"
                            value={formData.teacherRef}
                            onChange={(e) => setFormData({ ...formData, teacherRef: e.target.value })}
                        >
                            <option value="">-- Select Teacher --</option>
                            {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
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
                        {submitting ? "Saving..." : editingId ? "Update Subject" : "Create Subject"}
                    </button>
                </form>
            </CustomModal>
        </div>
    );
}
