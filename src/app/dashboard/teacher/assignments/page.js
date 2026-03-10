"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import DataTable from "@/components/Atoms/DataTable";
import CustomModal from "@/components/Atoms/CustomModal";
import FormInput from "@/components/Molecules/FormInput";
import { showSuccess, showError, showConfirm } from "@/lib/swal";

export default function ManageAssignments() {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const [assignments, setAssignments] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        classRef: "",
        subjectRef: "",
        teacherRef: "",
        dueDate: "",
        totalMarks: 100,
    });

    const fetchData = async () => {
        if (!session?.user?.email) return;
        try {
            setLoading(true);
            const ts = Date.now();
            const [resAssignments, resWeekly, resTeachers] = await Promise.all([
                fetch(`/api/assignments?ts=${ts}`),
                fetch(`/api/teacher/schedule/weekly?ts=${ts}`),
                fetch(`/api/teachers?ts=${ts}`),
            ]);
            const dataAssignments = await resAssignments.json();
            const dataWeekly = await resWeekly.json();
            const dataTeachers = await resTeachers.json();

            if (dataAssignments.success) {
                // Filter assignments for the current teacher
                const myEmail = session.user.email.toLowerCase().trim();
                const filtered = dataAssignments.data.filter(a => {
                    const teacherEmail = a.teacherRef?.email?.toLowerCase().trim();
                    return teacherEmail === myEmail;
                });
                setAssignments(filtered);
            }

            if (dataWeekly.success) {
                // Extract unique classes and subjects from the schedule
                const myClasses = [];
                const classIds = new Set();
                const mySubjects = [];
                const subjectIds = new Set();

                dataWeekly.data.forEach(item => {
                    if (item.classRef && !classIds.has(item.classRef._id)) {
                        classIds.add(item.classRef._id);
                        myClasses.push(item.classRef);
                    }
                    if (item.subjectRef && !subjectIds.has(item.subjectRef._id)) {
                        subjectIds.add(item.subjectRef._id);
                        mySubjects.push(item.subjectRef);
                    }
                });

                setClasses(myClasses);
                setSubjects(mySubjects);
            }

            if (dataTeachers.success) {
                setTeachers(dataTeachers.data);
                // Auto-fill teacherRef from session email
                const myEmail = session?.user?.email;
                if (myEmail) {
                    const me = dataTeachers.data.find(t => t.email.toLowerCase() === myEmail.toLowerCase());
                    if (me) setFormData(prev => ({ ...prev, teacherRef: me._id }));
                }
            }
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) {
            fetchData();
            const cid = searchParams.get("classId");
            if (cid) {
                setFormData(prev => ({ ...prev, classRef: cid }));
                setShowModal(true);
            }
        }
    }, [session, searchParams]);

    const handleDelete = async (id) => {
        const confirmResult = await showConfirm("Are you sure?", "You want to delete this assignment?");
        if (confirmResult.isConfirmed) {
            try {
                const res = await fetch(`/api/assignments/${id}`, { method: "DELETE" });
                const data = await res.json();
                if (data.success) {
                    showSuccess("Deleted!", "Assignment has been deleted.");
                    fetchData();
                } else {
                    showError("Failed!", data.error);
                }
            } catch (err) {
                showError("Error!", "Error deleting assignment");
            }
        }
    };

    const handleEdit = (assignment) => {
        setEditingId(assignment._id);
        setFormData({
            title: assignment.title,
            description: assignment.description || "",
            classRef: assignment.classRef ? assignment.classRef._id : "",
            subjectRef: assignment.subjectRef ? assignment.subjectRef._id : "",
            teacherRef: assignment.teacherRef ? assignment.teacherRef._id : "",
            dueDate: assignment.dueDate ? assignment.dueDate.split('T')[0] : "",
            totalMarks: assignment.totalMarks || 100,
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const method = editingId ? "PUT" : "POST";
        const url = editingId ? `/api/assignments/${editingId}` : "/api/assignments";

        try {
            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await res.json();

            if (res.ok && result.success) {
                showSuccess("Success!", editingId ? "Assignment Updated! ✅" : "Assignment Created! 🎉");
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
        setFormData({ title: "", description: "", classRef: "", subjectRef: "", teacherRef: "", dueDate: "", totalMarks: 100 });
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-0">Assignments</h2>
                    <p className="text-muted small">Create and manage class assignments</p>
                </div>
                <button className="btn btn-primary shadow-sm px-4" onClick={() => setShowModal(true)}>
                    <i className="bi bi-plus-lg me-2"></i> New Assignment
                </button>
            </div>

            <DataTable
                headers={["Title", "Class", "Subject", "Due Date", "Total Marks", "Actions"]}
                data={assignments}
                renderRow={(assign) => (
                    <tr key={assign._id}>
                        <td className="px-4 fw-bold text-primary">{assign.title}</td>
                        <td>{assign.classRef ? assign.classRef.name : "N/A"}</td>
                        <td>{assign.subjectRef ? assign.subjectRef.name : "N/A"}</td>
                        <td>{new Date(assign.dueDate).toLocaleDateString()}</td>
                        <td>{assign.totalMarks}</td>
                        <td className="text-end px-4">
                            <button className="btn btn-sm btn-light border me-2" onClick={() => handleEdit(assign)}>
                                <i className="bi bi-pencil"></i>
                            </button>
                            <button className="btn btn-sm btn-light border text-danger" onClick={() => handleDelete(assign._id)}>
                                <i className="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                )}
            />

            <CustomModal show={showModal} title={editingId ? "Edit Assignment" : "Create Assignment"} onClose={closeModal}>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <FormInput
                            label="Assignment Title"
                            value={formData.title}
                            required
                            placeholder="e.g. Algebra Chapter 1"
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>
                    <div className="mb-3">
                        <FormInput
                            label="Description"
                            type="textarea"
                            value={formData.description}
                            placeholder="Task instructions..."
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label small fw-bold text-muted">Class</label>
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
                        <div className="col-md-6 mb-3">
                            <label className="form-label small fw-bold text-muted">Subject</label>
                            <select
                                className="form-select border-0 bg-light"
                                value={formData.subjectRef}
                                onChange={(e) => setFormData({ ...formData, subjectRef: e.target.value })}
                                required
                            >
                                <option value="">-- Select Subject --</option>
                                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label small fw-bold text-muted">Teacher</label>
                            <input
                                className="form-control border-0 bg-light"
                                readOnly
                                value={teachers.find(t => t._id === formData.teacherRef)?.name || session?.user?.name || "You"}
                                title="Auto-filled from your logged-in account"
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <FormInput
                                label="Due Date"
                                type="date"
                                value={formData.dueDate}
                                required
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <FormInput
                            label="Total Marks"
                            type="number"
                            value={formData.totalMarks}
                            required
                            onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100 fw-bold py-2" disabled={submitting}>
                        {submitting ? "Saving..." : editingId ? "Update Assignment" : "Assign Now"}
                    </button>
                </form>
            </CustomModal>
        </div>
    );
}
