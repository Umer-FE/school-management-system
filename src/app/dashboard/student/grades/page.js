"use client";
import { useState, useEffect } from "react";
import DataTable from "@/components/Atoms/DataTable";

export default function StudentGrades() {
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            // In a real app we'd pass `?studentRef=currentUser.id`
            const resGrades = await fetch("/api/grades");
            const dataGrades = await resGrades.json();

            if (dataGrades.success) setGrades(dataGrades.data);
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="container-fluid py-4">
            <div className="row mb-4">
                <div className="col-md-8">
                    <h2 className="fw-bold text-dark mb-0">My Grades</h2>
                    <p className="text-muted small">View your academic performance and feedback</p>
                </div>
                <div className="col-md-4 text-end">
                    <div className="d-inline-block bg-white px-4 py-2 rounded-pill shadow-sm border border-light">
                        <span className="text-muted me-2 small fw-bold">Average:</span>
                        <span className="text-primary fw-bold" style={{ fontSize: '1.1rem' }}>A-</span>
                    </div>
                </div>
            </div>

            <DataTable
                headers={["Assignment", "Total Marks", "Marks Obtained", "Percentage", "Feedback"]}
                data={grades}
                renderRow={(grade) => {
                    const total = grade.assignmentRef?.totalMarks || 100;
                    const percentage = Math.round((grade.marksObtained / total) * 100);

                    return (
                        <tr key={grade._id}>
                            <td className="px-4 fw-bold">{grade.assignmentRef ? grade.assignmentRef.title : "N/A"}</td>
                            <td className="text-muted">{total}</td>
                            <td className="fw-bold text-primary" style={{ fontSize: '1.1rem' }}>{grade.marksObtained}</td>
                            <td>
                                <span className={`badge rounded-pill ${percentage >= 80 ? 'bg-success' : percentage >= 50 ? 'bg-warning' : 'bg-danger'}`}>
                                    {percentage}%
                                </span>
                            </td>
                            <td className="px-4"><small className="text-muted fst-italic">"{grade.feedback || "No feedback provided."}"</small></td>
                        </tr>
                    );
                }}
            />
        </div>
    );
}
