"use client";
import { useState, useEffect } from "react";
import StatCard from "@/components/Molecules/StatCard";
import SchoolChart from "@/components/Molecules/SchoolChart";

export default function ReportsAnalytics() {
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState({
        totalStudents: 0,
        totalTeachers: 0,
        overallAttendanceProps: { labels: [], data: [] },
        gradeDistribution: { labels: ["A", "B", "C", "D", "F"], data: [0, 0, 0, 0, 0] }
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            // In a real production app we would have a specialized `/api/reports` endpoint 
            // performing Mongoose aggregations. For now, we will fetch base entities
            // and do a quick client-side aggregation for demonstration purposes.

            const [resStudents, resTeachers, resGrades, resAttendance] = await Promise.all([
                fetch("/api/students"),
                fetch("/api/teachers"),
                fetch("/api/grades"),
                fetch("/api/attendance") // Fetches today's attendance typically, but assuming overall
            ]);

            const [dataStudents, dataTeachers, dataGrades, dataAttendance] = await Promise.all([
                resStudents.json(),
                resTeachers.json(),
                resGrades.json(),
                resAttendance.json()
            ]);

            let gradesCount = { A: 0, B: 0, C: 0, D: 0, F: 0 };
            if (dataGrades.success && dataGrades.data) {
                dataGrades.data.forEach(g => {
                    const total = g.assignmentRef?.totalMarks || 100;
                    const pct = (g.marksObtained / total) * 100;
                    if (pct >= 90) gradesCount.A++;
                    else if (pct >= 80) gradesCount.B++;
                    else if (pct >= 70) gradesCount.C++;
                    else if (pct >= 60) gradesCount.D++;
                    else gradesCount.F++;
                });
            }

            let attLabels = ["Present", "Absent", "Leave"];
            let attData = [0, 0, 0];
            if (dataAttendance.success && dataAttendance.data) {
                dataAttendance.data.forEach(a => {
                    if (a.status === "Present") attData[0]++;
                    else if (a.status === "Absent") attData[1]++;
                    else if (a.status === "Leave") attData[2]++;
                });
            }

            setReportData({
                totalStudents: dataStudents.success ? dataStudents.data.length : 0,
                totalTeachers: dataTeachers.success ? dataTeachers.data.length : 0,
                overallAttendanceProps: { labels: attLabels, data: attData },
                gradeDistribution: { labels: Object.keys(gradesCount), data: Object.values(gradesCount) }
            });

        } catch (err) {
            console.error("Error generating reports:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="container-fluid py-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading reports...</span>
                </div>
                <p className="mt-3 text-muted">Aggregating school data...</p>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-1">Reports & Analytics</h2>
                    <p className="text-muted mb-0">Overview of academic and operational metrics</p>
                </div>
                <button className="btn btn-primary px-4 fw-bold shadow-sm d-flex align-items-center gap-2" onClick={fetchData}>
                    <i className="bi bi-arrow-clockwise"></i> Refresh Data
                </button>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm p-3" style={{ borderRadius: "15px", borderLeft: "5px solid #0d6efd !important" }}>
                        <h6 className="text-muted small fw-bold text-uppercase mb-1">Total Students</h6>
                        <h2 className="fw-bold mb-0">{reportData.totalStudents}</h2>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm p-3" style={{ borderRadius: "15px", borderLeft: "5px solid #198754 !important" }}>
                        <h6 className="text-muted small fw-bold text-uppercase mb-1">Total Teachers</h6>
                        <h2 className="fw-bold mb-0">{reportData.totalTeachers}</h2>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm p-3" style={{ borderRadius: "15px", borderLeft: "5px solid #ffc107 !important" }}>
                        <h6 className="text-muted small fw-bold text-uppercase mb-1">Average Attendance</h6>
                        <h2 className="fw-bold mb-0">
                            {reportData.overallAttendanceProps.data[0] > 0
                                ? Math.round((reportData.overallAttendanceProps.data[0] / reportData.overallAttendanceProps.data.reduce((a, b) => a + b, 0)) * 100)
                                : 0}%
                        </h2>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm p-3" style={{ borderRadius: "15px", borderLeft: "5px solid #dc3545 !important" }}>
                        <h6 className="text-muted small fw-bold text-uppercase mb-1">Assessments Given</h6>
                        <h2 className="fw-bold mb-0">{reportData.gradeDistribution.data.reduce((a, b) => a + b, 0)}</h2>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm p-4" style={{ borderRadius: "15px" }}>
                        <h5 className="fw-bold mb-4">Grade Distribution</h5>
                        <div style={{ height: "300px" }}>
                            <SchoolChart
                                type="bar"
                                labels={reportData.gradeDistribution.labels}
                                data={reportData.gradeDistribution.data}
                                title="Student Grades"
                            />
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm p-4" style={{ borderRadius: "15px" }}>
                        <h5 className="fw-bold mb-4">Overall Attendance Status</h5>
                        <div style={{ height: "300px" }}>
                            <SchoolChart
                                type="pie"
                                labels={reportData.overallAttendanceProps.labels}
                                data={reportData.overallAttendanceProps.data}
                                title="Attendance"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
