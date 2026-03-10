"use client";
import { useState, useEffect } from "react";
import DataTable from "@/components/Atoms/DataTable";
import CustomModal from "@/components/Atoms/CustomModal";
import FormInput from "@/components/Molecules/FormInput";
import { showSuccess, showError, showConfirm } from "@/lib/swal";

export default function ManageTimetable() {
    const [timetables, setTimetables] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [formData, setFormData] = useState({
        classRef: "",
        subjectRef: "",
        teacherRef: "",
        daysOfWeek: ["Monday"], // Changed to array
        startTime: "",
        endTime: "",
    });

    const dayOrder = {
        "Monday": 1,
        "Tuesday": 2,
        "Wednesday": 3,
        "Thursday": 4,
        "Friday": 5,
        "Saturday": 6,
        "Sunday": 7
    };

    const sortedTimetables = [...timetables].sort((a, b) => {
        const dayDiff = (dayOrder[a.dayOfWeek] || 0) - (dayOrder[b.dayOfWeek] || 0);
        if (dayDiff !== 0) return dayDiff;
        return (a.startTime || "").localeCompare(b.startTime || "");
    });

    const filteredTimetables = sortedTimetables.filter(t => {
        const query = searchTerm.toLowerCase();
        return (
            t.classRef?.name?.toLowerCase().includes(query) ||
            t.subjectRef?.name?.toLowerCase().includes(query) ||
            t.teacherRef?.name?.toLowerCase().includes(query) ||
            t.dayOfWeek?.toLowerCase().includes(query)
        );
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const ts = Date.now();
            const [resTimetables, resClasses, resSubjects, resTeachers] = await Promise.all([
                fetch(`/api/timetable?ts=${ts}`),
                fetch(`/api/classes?ts=${ts}`),
                fetch(`/api/subjects?ts=${ts}`),
                fetch(`/api/teachers?ts=${ts}`),
            ]);
            const dataTimetables = await resTimetables.json();
            const dataClasses = await resClasses.json();
            const dataSubjects = await resSubjects.json();
            const dataTeachers = await resTeachers.json();

            if (dataTimetables.success) setTimetables(dataTimetables.data);
            if (dataClasses.success) setClasses(dataClasses.data);
            if (dataSubjects.success) setSubjects(dataSubjects.data);
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
        const confirmResult = await showConfirm("Are you sure?", "You want to delete this timetable entry?");
        if (confirmResult.isConfirmed) {
            try {
                const res = await fetch(`/api/timetable/${id}`, { method: "DELETE" });
                const data = await res.json();
                if (data.success) {
                    showSuccess("Deleted!", "Timetable entry has been deleted.");
                    fetchData();
                } else {
                    showError("Failed!", data.error);
                }
            } catch (err) {
                showError("Error!", "Something went wrong.");
            }
        }
    };

    const handleEdit = (entry) => {
        setEditingId(entry._id);

        // Find all days that have this EXACT same schedule (Class + Subject + Teacher + Time)
        // This helps the user see all days that were assigned together.
        const siblingDays = timetables
            .filter(t =>
                (t.classRef?._id || t.classRef) === (entry.classRef?._id || entry.classRef) &&
                (t.subjectRef?._id || t.subjectRef) === (entry.subjectRef?._id || entry.subjectRef) &&
                (t.teacherRef?._id || t.teacherRef) === (entry.teacherRef?._id || entry.teacherRef) &&
                t.startTime === entry.startTime &&
                t.endTime === entry.endTime
            )
            .map(t => t.dayOfWeek);

        setFormData({
            classRef: entry.classRef?._id || entry.classRef || "",
            subjectRef: entry.subjectRef?._id || entry.subjectRef || "",
            teacherRef: entry.teacherRef?._id || entry.teacherRef || "",
            daysOfWeek: siblingDays.length > 0 ? siblingDays : [entry.dayOfWeek],
            startTime: entry.startTime,
            endTime: entry.endTime,
        });
        setShowModal(true);
    };

    const toggleDay = (day) => {
        setFormData(prev => {
            const days = prev.daysOfWeek.includes(day)
                ? prev.daysOfWeek.filter(d => d !== day)
                : [...prev.daysOfWeek, day];
            return { ...prev, daysOfWeek: days };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        if (formData.daysOfWeek.length === 0) {
            showError("Missing Days!", "Please select at least one day");
            setSubmitting(false);
            return;
        }

        try {
            console.log("Submitting payload:", formData);
            if (editingId) {
                // SESSION SYNC LOGIC
                // 1. Find the original record to get the "slot" identity
                const originalEntry = timetables.find(t => t._id === editingId);
                if (!originalEntry) throw new Error("Original record not found");

                // 2. Identify all "siblings" (all days for this specific class/subject/teacher/time combination)
                const siblings = timetables.filter(t =>
                    (t.classRef?._id || t.classRef) === (originalEntry.classRef?._id || originalEntry.classRef) &&
                    (t.subjectRef?._id || t.subjectRef) === (originalEntry.subjectRef?._id || originalEntry.subjectRef) &&
                    (t.teacherRef?._id || t.teacherRef) === (originalEntry.teacherRef?._id || originalEntry.teacherRef) &&
                    t.startTime === originalEntry.startTime &&
                    t.endTime === originalEntry.endTime
                );

                const promises = [];

                // A. For each day in the NEW selection:
                for (const day of formData.daysOfWeek) {
                    const existingRecord = siblings.find(s => s.dayOfWeek === day);
                    if (existingRecord) {
                        // UPDATE existing
                        promises.push(
                            fetch(`/api/timetable/${existingRecord._id}`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    classRef: formData.classRef,
                                    subjectRef: formData.subjectRef,
                                    teacherRef: formData.teacherRef,
                                    dayOfWeek: day,
                                    startTime: formData.startTime,
                                    endTime: formData.endTime,
                                }),
                            }).then(r => r.json())
                        );
                    } else {
                        // CREATE new record for this day
                        promises.push(
                            fetch("/api/timetable", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    classRef: formData.classRef,
                                    subjectRef: formData.subjectRef,
                                    teacherRef: formData.teacherRef,
                                    dayOfWeek: day,
                                    startTime: formData.startTime,
                                    endTime: formData.endTime,
                                }),
                            }).then(r => r.json())
                        );
                    }
                }

                // B. For each record in siblings that is NOT in the new selection: DELETE it
                for (const sib of siblings) {
                    if (!formData.daysOfWeek.includes(sib.dayOfWeek)) {
                        promises.push(
                            fetch(`/api/timetable/${sib._id}`, { method: "DELETE" }).then(r => r.json())
                        );
                    }
                }

                const results = await Promise.all(promises);
                console.log("Sync Results:", results);

                showSuccess("Synced!", "Weekly schedule has been synchronized.");
                closeModal();
                fetchData();
            } else {
                // Bulk create for all selected days (New Entry Mode)
                console.log("Add Mode (Bulk):", formData.daysOfWeek);
                const promises = formData.daysOfWeek.map(day =>
                    fetch("/api/timetable", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            classRef: formData.classRef,
                            subjectRef: formData.subjectRef,
                            teacherRef: formData.teacherRef,
                            dayOfWeek: day,
                            startTime: formData.startTime,
                            endTime: formData.endTime,
                        }),
                    }).then(r => r.json())
                );

                const results = await Promise.all(promises);
                const errors = results.filter(r => !r.success);

                if (errors.length === 0) {
                    showSuccess("Success!", "Schedules added for all selected days.");
                    closeModal();
                    fetchData();
                } else {
                    showError("Partial failure!", `Added with errors: ${errors.map(e => e.error).join(", ")}`);
                }
            }
        } catch (error) {
            console.error("Submission Error:", error);
            showError("Error!", "Error processing request: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData({ classRef: "", subjectRef: "", teacherRef: "", daysOfWeek: ["Monday"], startTime: "", endTime: "" });
    };

    return (
        <div className="container-fluid py-4">
            {/* Modern Header Section */}
            <div className="card border-0 shadow-sm rounded-4 mb-4 p-4 bg-white">
                <div className="row align-items-center g-3">
                    <div className="col-lg-5">
                        <h2 className="fw-bold text-dark mb-1">Timetable Management</h2>
                        <p className="text-muted small mb-0">Manage class schedules and teacher assignments</p>
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
                                    placeholder="Search by class, subject or teacher..."
                                    style={{ boxShadow: 'none' }}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button
                                className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm hover-pull-up"
                                onClick={() => setShowModal(true)}
                            >
                                <i className="bi bi-plus-lg me-2"></i> Add Schedule
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <DataTable
                headers={["Class", "Subject", "Teacher", "Day", "Time", "Actions"]}
                data={filteredTimetables}
                renderRow={(entry) => (
                    <tr key={entry._id}>
                        <td className="px-4 fw-bold">{entry.classRef ? entry.classRef.name : "N/A"}</td>
                        <td>{entry.subjectRef ? entry.subjectRef.name : "N/A"}</td>
                        <td>{entry.teacherRef ? entry.teacherRef.name : "N/A"}</td>
                        <td className="text-primary fw-bold">{entry.dayOfWeek}</td>
                        <td className="text-muted">{entry.startTime} - {entry.endTime}</td>
                        <td className="text-end px-4">
                            <button className="btn btn-sm btn-light border me-2" onClick={() => handleEdit(entry)}>
                                <i className="bi bi-pencil"></i>
                            </button>
                            <button className="btn btn-sm btn-light border text-danger" onClick={() => handleDelete(entry._id)}>
                                <i className="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                )}
            />

            <CustomModal show={showModal} title={editingId ? "Edit Schedule" : "Add Schedule"} onClose={closeModal}>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
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
                    <div className="row">
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
                        <div className="col-md-6 mb-3">
                            <label className="form-label small fw-bold text-muted">Teacher</label>
                            <select
                                className="form-select border-0 bg-light"
                                value={formData.teacherRef}
                                onChange={(e) => setFormData({ ...formData, teacherRef: e.target.value })}
                                required
                            >
                                <option value="">-- Select Teacher --</option>
                                {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted d-block">Days of Week</label>
                        <div className="d-flex flex-wrap gap-2">
                            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                                <div key={day} className="form-check form-check-inline">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={`check-${day}`}
                                        checked={formData.daysOfWeek.includes(day)}
                                        onChange={() => toggleDay(day)}
                                    />
                                    <label className="form-check-label small" htmlFor={`check-${day}`}>{day}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6 mb-4">
                            <FormInput
                                label="Start Time"
                                type="time"
                                value={formData.startTime}
                                required
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                            />
                        </div>
                        <div className="col-md-6 mb-4">
                            <FormInput
                                label="End Time"
                                type="time"
                                value={formData.endTime}
                                required
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary w-100 fw-bold py-2" disabled={submitting}>
                        {submitting ? "Saving..." : editingId ? "Update Schedule" : "Add Schedule"}
                    </button>
                </form>
            </CustomModal>
        </div>
    );
}
