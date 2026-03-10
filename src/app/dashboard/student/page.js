"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import StatCard from "@/components/Molecules/StatCard";
import CardSkeleton from "@/components/Molecules/CardSkeleton";

export default function StudentDashboard() {
    const { data: session } = useSession();
    const [stats, setStats] = useState({
        attendance: "0%",
        pendingAssignments: "0",
        recentGrade: "N/A"
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!session?.user?.email) return;
            try {
                setLoading(true);
                // 1. Fetch Attendance
                const attRes = await fetch("/api/attendance");
                const attData = await attRes.json();

                let attPercent = "0%";
                if (attData.success && attData.data.length > 0) {
                    const present = attData.data.filter(a => a.status === "Present").length;
                    attPercent = Math.round((present / attData.data.length) * 100) + "%";
                }

                // 2. Fetch Grades
                const gradeRes = await fetch("/api/grades");
                const gradeData = await gradeRes.json();
                let lastGrade = "N/A";
                if (gradeData.success && gradeData.data.length > 0) {
                    lastGrade = gradeData.data[0].grade || "A"; // Fallback if exists
                }

                // 3. Fetch Assignments Count
                const assignRes = await fetch("/api/assignments");
                const assignData = await assignRes.json();
                let assignCount = "0";
                if (assignData.success) {
                    assignCount = assignData.data.length.toString();
                }

                setStats({
                    attendance: attPercent,
                    pendingAssignments: assignCount,
                    recentGrade: lastGrade
                });
            } catch (error) {
                console.error("Dashboard Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [session]);

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-0">
                        Welcome, {session?.user?.name || "Student"}!
                    </h2>
                    <p className="text-muted small">Here is your academic overview</p>
                </div>
            </div>

            <div className="row g-4">
                {loading ? (
                    <>
                        <div className="col-md-4"><CardSkeleton /></div>
                        <div className="col-md-4"><CardSkeleton /></div>
                        <div className="col-md-4"><CardSkeleton /></div>
                    </>
                ) : (
                    <>
                        <div className="col-md-4">
                            <StatCard
                                title="Attendance"
                                value={stats.attendance}
                                icon="bi-calendar-check"
                                bgColor="bg-info"
                                trend="Calculated"
                            />
                        </div>
                        <div className="col-md-4">
                            <StatCard
                                title="Pending Assignments"
                                value={stats.pendingAssignments}
                                icon="bi-file-earmark-text"
                                bgColor="bg-warning"
                                trend="Due Soon"
                            />
                        </div>
                        <div className="col-md-4">
                            <StatCard
                                title="Recent Grades"
                                value={stats.recentGrade}
                                icon="bi-award"
                                bgColor="bg-success"
                                trend="Latest"
                            />
                        </div>
                    </>
                )}
            </div>

            <div className="row mt-5 g-4">
                <div className="col-12">
                    <div className="card border-0 shadow-sm" style={{ borderRadius: "15px" }}>
                        <div className="card-header bg-white py-3 border-0">
                            <h5 className="mb-0 fw-bold">Recent Announcements</h5>
                        </div>
                        <div className="card-body">
                            <p className="text-muted">No new announcements.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
