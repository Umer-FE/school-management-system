"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import DataTable from "@/components/Atoms/DataTable";
import CustomModal from "@/components/Atoms/CustomModal";
import FormInput from "@/components/Molecules/FormInput";
import { showSuccess, showError, showConfirm } from "@/lib/swal";

export default function ManageGrades() {
    const { data: session } = useSession();
    const [grades, setGrades] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        assignmentRef: "",
        studentRef: "",
        marksObtained: "",
        feedback: "",
    });

    const fetchData = async () => {
        if (!session?.user?.email) return;
        try {
            setLoading(true);
            const ts = Date.now();
            const [resGrades, resAssign, resStudents, resTimetable, resTeachers] = await Promise.all([
                fetch(`/api/grades?ts=${ts}`),
                fetch(`/api/assignments?ts=${ts}`),
                fetch(`/api/students?ts=${ts}`),
                fetch(`/api/timetable?ts=${ts}`),
                fetch(`/api/teachers?ts=${ts}`),
            ]);
            const dataGrades = await resGrades.json();
            const dataAssign = await resAssign.json();
            const dataStudents = await resStudents.json();
            const dataTimetable = await resTimetable.json();
            const dataTeachers = await resTeachers.json();

            const myEmail = session.user.email.toLowerCase();
            const myProfile = dataTeachers.success ? dataTeachers.data.find(t => t.email.toLowerCase() === myEmail) : null;

            if (dataAssign.success) {
                const myAssignments = dataAssign.data.filter(a => a.teacherRef?.email?.toLowerCase() === myEmail);
                setAssignments(myAssignments);

                if (dataGrades.success) {
                    const myGrades = dataGrades.data.filter(g =>
                        g.assignmentRef?.teacherRef?.email?.toLowerCase() === myEmail ||
                        g.assignmentRef?.teacherRef?._id === myProfile?._id
                    );
                    setGrades(myGrades);
                }
            }

            if (dataStudents.success && dataTimetable.success && myProfile) {
                const myClassNames = new Set(
                    dataTimetable.data
                        .filter(t => (t.teacherRef?._id || t.teacherRef) === myProfile._id)
                        .map(t => t.classRef?.name)
                        .filter(Boolean)
                );
                const myStudents = dataStudents.data.filter(s => myClassNames.has(s.class));
                setStudents(myStudents);
            }

        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) fetchData();
    }, [session]);

    const handleDelete = async (id) => {
        const confirmResult = await showConfirm("Are you sure?", "You want to delete this grade?");
        if (confirmResult.isConfirmed) {
            try {
                const res = await fetch(`/api/grades/${id}`, { method: "DELETE" });
                const data = await res.json();
                if (data.success) {
                    showSuccess("Deleted!", "Grade has been deleted.");
                    fetchData();
                } else {
                    showError("Failed!", data.error);
                }
            } catch (err) {
                showError("Error!", "Error deleting grade");
            }
        }
    };

    const handleEdit = (grade) => {
        setEditingId(grade._id);
        setFormData({
            assignmentRef: grade.assignmentRef ? grade.assignmentRef._id : "",
            studentRef: grade.studentRef ? grade.studentRef._id : "",
            marksObtained: grade.marksObtained,
            feedback: grade.feedback || "",
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const method = editingId ? "PUT" : "POST";
        const url = editingId ? `/api/grades/${editingId}` : "/api/grades";

        try {
            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await res.json();

            if (res.ok && result.success) {
                showSuccess("Success!", editingId ? "Grade Updated! ✅" : "Grade Submitted! 🎉");
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
        setFormData({ assignmentRef: "", studentRef: "", marksObtained: "", feedback: "" });
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-0">Grades</h2>
                    <p className="text-muted small">Evaluate and manage student grades</p>
                </div>
                <button className="btn btn-primary shadow-sm px-4" onClick={() => setShowModal(true)}>
                    <i className="bi bi-plus-lg me-2"></i> Enter Grade
                </button>
            </div>

            <DataTable
                headers={["Assignment", "Student", "Marks Obtained", "Total Marks", "Feedback", "Actions"]}
                data={grades}
                renderRow={(grade) => (
                    <tr key={grade._id}>
                        <td className="px-4 fw-bold">{grade.assignmentRef ? grade.assignmentRef.title : "N/A"}</td>
                        <td>{grade.studentRef ? grade.studentRef.name : "N/A"}</td>
                        <td className="fw-bold text-primary">{grade.marksObtained}</td>
                        <td className="text-muted">{grade.assignmentRef ? grade.assignmentRef.totalMarks : "N/A"}</td>
                        <td><small className="text-muted">{grade.feedback || "None"}</small></td>
                        <td className="text-end px-4">
                            <button className="btn btn-sm btn-light border me-2" onClick={() => handleEdit(grade)}>
                                <i className="bi bi-pencil"></i>
                            </button>
                            <button className="btn btn-sm btn-light border text-danger" onClick={() => handleDelete(grade._id)}>
                                <i className="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                )}
            />

            <CustomModal show={showModal} title={editingId ? "Edit Grade" : "Enter New Grade"} onClose={closeModal}>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted">Assignment</label>
                        <select
                            className="form-select border-0 bg-light"
                            value={formData.assignmentRef}
                            onChange={(e) => setFormData({ ...formData, assignmentRef: e.target.value })}
                            required
                        >
                            <option value="">-- Select Assignment --</option>
                            {assignments.map(a => <option key={a._id} value={a._id}>{a.title} ({a.totalMarks} Marks)</option>)}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted">Student</label>
                        <select
                            className="form-select border-0 bg-light"
                            value={formData.studentRef}
                            onChange={(e) => setFormData({ ...formData, studentRef: e.target.value })}
                            required
                        >
                            <option value="">-- Select Student --</option>
                            {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.class})</option>)}
                        </select>
                    </div>
                    <div className="mb-3">
                        <FormInput
                            label="Marks Obtained"
                            type="number"
                            value={formData.marksObtained}
                            required
                            onChange={(e) => setFormData({ ...formData, marksObtained: e.target.value })}
                        />
                    </div>
                    <div className="mb-4">
                        <FormInput
                            label="Feedback (Optional)"
                            type="textarea"
                            value={formData.feedback}
                            placeholder="Good job! Keep it up..."
                            onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100 fw-bold py-2" disabled={submitting}>
                        {submitting ? "Saving..." : editingId ? "Update Grade" : "Submit Grade"}
                    </button>
                </form>
            </CustomModal>
        </div>
    );
}
