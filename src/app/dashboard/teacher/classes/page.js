"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import CustomModal from "@/components/Atoms/CustomModal";

export default function TeacherClasses() {
    const { data: session } = useSession();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedClass, setSelectedClass] = useState(null);
    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (session?.user?.email) {
            fetchClasses();
        }
    }, [session]);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/teacher/schedule/weekly");
            const data = await res.json();
            if (data.success) {
                // Extract unique classes from the schedule
                const uniqueClasses = [];
                const classIds = new Set();

                data.data.forEach(item => {
                    if (item.classRef && !classIds.has(item.classRef._id)) {
                        classIds.add(item.classRef._id);
                        uniqueClasses.push({
                            _id: item.classRef._id,
                            name: item.classRef.name,
                            subject: item.subjectRef?.name || "Multiple"
                        });
                    }
                });
                setClasses(uniqueClasses);
            }
        } catch (err) {
            console.error("Error fetching classes:", err);
        } finally {
            setLoading(false);
        }
    };

    const viewStudents = async (cls) => {
        setSelectedClass(cls);
        setShowModal(true);
        setLoadingStudents(true);
        try {
            const res = await fetch(`/api/students?classId=${cls._id}`);
            const data = await res.json();
            if (data.success) {
                setStudents(data.data);
            }
        } catch (err) {
            console.error("Error fetching students:", err);
        } finally {
            setLoadingStudents(false);
        }
    };

    return (
        <div className="container-fluid py-4">
            <div className="mb-4">
                <h2 className="fw-bold text-dark mb-0">My Assigned Classes</h2>
                <p className="text-muted small">Overview of clinical sessions and student groups</p>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                </div>
            ) : classes.length > 0 ? (
                <div className="row g-4">
                    {classes.map((cls) => (
                        <div key={cls._id} className="col-md-6 col-lg-4">
                            <div className="card border-0 shadow-sm h-100 transition-hover">
                                <div className="card-body p-4">
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="bg-primary bg-opacity-10 p-3 rounded-3 me-3">
                                            <i className="bi bi-building text-primary fs-4"></i>
                                        </div>
                                        <div>
                                            <h5 className="fw-bold mb-0">{cls.name}</h5>
                                            <span className="text-muted small">{cls.subject}</span>
                                        </div>
                                    </div>

                                    <div className="d-grid gap-2 mt-4">
                                        <button
                                            className="btn btn-outline-primary fw-semibold py-2"
                                            onClick={() => viewStudents(cls)}
                                        >
                                            <i className="bi bi-people me-2"></i> View Students
                                        </button>
                                        <div className="d-flex gap-2">
                                            <Link
                                                href={`/dashboard/teacher/attendance/${cls._id}`}
                                                className="btn btn-primary flex-grow-1 fw-semibold py-2"
                                            >
                                                Attendance
                                            </Link>
                                            <Link
                                                href={`/dashboard/teacher/grades?classId=${cls._id}`}
                                                className="btn btn-light border flex-grow-1 fw-semibold py-2"
                                            >
                                                Grades
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-5 bg-white rounded-3 shadow-sm">
                    <i className="bi bi-calendar-x text-muted display-1"></i>
                    <p className="mt-3 text-muted">You don't have any classes assigned in the timetable.</p>
                </div>
            )}

            <CustomModal
                show={showModal}
                title={`Students - ${selectedClass?.name}`}
                onClose={() => setShowModal(false)}
                size="lg"
            >
                <div className="table-responsive">
                    {loadingStudents ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary" role="status"></div>
                        </div>
                    ) : students.length > 0 ? (
                        <table className="table table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student) => (
                                    <tr key={student._id}>
                                        <td className="fw-bold">{student.name}</td>
                                        <td className="text-muted">{student.email}</td>
                                        <td>
                                            <Link
                                                href={`/dashboard/teacher/grades?studentId=${student._id}`}
                                                className="btn btn-sm btn-link text-decoration-none"
                                            >
                                                View Report
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center py-4 text-muted">No students found in this class.</p>
                    )}
                </div>
            </CustomModal>

            <style jsx>{`
                .transition-hover {
                    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
                }
                .transition-hover:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
                }
            `}</style>
        </div>
    );
}
