"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import StatCard from "@/components/Molecules/StatCard";
import CardSkeleton from "@/components/Molecules/CardSkeleton";
import WeeklyCalendar from "@/components/Organisms/WeeklyCalendar";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function TeacherDashboard() {
    const { data: session } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState({
        totalAssignments: 0,
        ungradedAssignments: 0,
        attendance: "0%",
        totalStudents: 0,
    });
    const [todaySchedule, setTodaySchedule] = useState([]);
    const [weeklySchedule, setWeeklySchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("today"); // today, weekly
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!session?.user?.email) return;

            try {
                // Fetch all required data concurrently
                const [resAssign, resGrades, resStudents, resToday, resWeekly, resTeachers] = await Promise.all([
                    fetch("/api/assignments"),
                    fetch("/api/grades"),
                    fetch("/api/students"),
                    fetch("/api/teacher/schedule/today"),
                    fetch("/api/teacher/schedule/weekly"),
                    fetch("/api/teachers"),
                ]);

                const dataAssign = await resAssign.json();
                const dataGrades = await resGrades.json();
                const dataStudents = await resStudents.json();
                const dataToday = await resToday.json();
                const dataWeekly = await resWeekly.json();
                const dataTeachers = await resTeachers.json();

                if (dataToday.success) setTodaySchedule(dataToday.data);
                if (dataWeekly.success) setWeeklySchedule(dataWeekly.data);

                const myEmail = session?.user?.email;
                if (!myEmail) return;

                const myProfile = dataTeachers.success
                    ? dataTeachers.data.find(t => t.email === myEmail)
                    : null;

                // 2. Attendance
                let attendancePercent = "0%";
                if (myProfile?._id) {
                    const resAtt = await fetch(`/api/teachers/attendance?teacherId=${myProfile._id}`);
                    const dataAtt = await resAtt.json();
                    if (dataAtt.success && dataAtt.data.length > 0) {
                        const present = dataAtt.data.filter(a => a.status === "Present").length;
                        attendancePercent = Math.round((present / dataAtt.data.length) * 100) + "%";
                    }
                }

                // 3. Assignments
                let myAssignments = [];
                if (dataAssign.success) {
                    myAssignments = dataAssign.data.filter(
                        a => a.teacherRef?.email === myEmail || a.teacherRef?.name === session?.user?.name
                    );
                }

                let gradedIds = new Set();
                if (dataGrades.success) {
                    dataGrades.data.forEach(g => {
                        const assignId = g.assignmentRef?._id || g.assignmentRef;
                        if (assignId) gradedIds.add(String(assignId));
                    });
                }
                const ungraded = myAssignments.filter(a => !gradedIds.has(String(a._id)));

                setStats({
                    totalAssignments: myAssignments.length,
                    ungradedAssignments: ungraded.length,
                    attendance: attendancePercent,
                    totalStudents: dataStudents.success ? dataStudents.data.length : 0,
                });
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        if (session) fetchDashboardData();
    }, [session]);

    const getClassStatus = (startTime, endTime) => {
        const now = currentTime;
        const [startH, startM] = startTime.split(":").map(Number);
        const [endH, endM] = endTime.split(":").map(Number);

        const start = new Date(now);
        start.setHours(startH, startM, 0);

        const end = new Date(now);
        end.setHours(endH, endM, 0);

        if (now >= start && now <= end) return "Live";
        if (now > end) return "Completed";
        return "Upcoming";
    };

    const handleMarkAttendance = (classId) => {
        if (!classId) {
            toast.error("Class ID not found");
            return;
        }
        router.push(`/dashboard/teacher/attendance/${classId}`);
    };

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-0">
                        Welcome, {session?.user?.name || "Teacher"}!
                    </h2>
                    <p className="text-muted small text-uppercase fw-bold ls-widest" style={{ letterSpacing: "1px" }}>
                        Professional Dashboard • {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="btn-group shadow-sm" style={{ borderRadius: "10px", overflow: "hidden" }}>
                    <button
                        className={`btn btn-${activeTab === 'today' ? 'primary' : 'white text-muted'} border-0 px-4`}
                        onClick={() => setActiveTab('today')}
                    >
                        Today's Schedule
                    </button>
                    <button
                        className={`btn btn-${activeTab === 'weekly' ? 'primary' : 'white text-muted'} border-0 px-4`}
                        onClick={() => setActiveTab('weekly')}
                    >
                        Weekly View
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="row g-4">
                    {[1, 2, 3, 4].map(i => (
                        <div className="col-md-3" key={i}><CardSkeleton /></div>
                    ))}
                </div>
            ) : activeTab === "today" ? (
                <>
                    <div className="row g-4 mb-5">
                        <div className="col-md-3">
                            <StatCard
                                title="My Students"
                                value={String(stats.totalStudents)}
                                icon="bi-people"
                                bgColor="bg-primary"
                                trend="Global Count"
                            />
                        </div>
                        <div className="col-md-3">
                            <StatCard
                                title="Attendance"
                                value={stats.attendance}
                                icon="bi-person-check"
                                bgColor="bg-info"
                                trend="My Average"
                            />
                        </div>
                        <div className="col-md-3">
                            <StatCard
                                title="Assignments"
                                value={String(stats.totalAssignments)}
                                icon="bi-journal-check"
                                bgColor="bg-dark"
                                trend="Total Created"
                            />
                        </div>
                        <div className="col-md-3">
                            <StatCard
                                title="Needs Grading"
                                value={String(stats.ungradedAssignments)}
                                icon="bi-file-earmark-text"
                                bgColor="bg-warning"
                                trend="Pending Review"
                            />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-lg-12">
                            <div className="card border-0 shadow-sm" style={{ borderRadius: "15px" }}>
                                <div className="card-header bg-white py-4 border-0 d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0 fw-bold">Daily Timeline</h5>
                                    <span className="badge bg-light text-primary px-3 py-2 rounded-pill">
                                        {todaySchedule.length} Classes Today
                                    </span>
                                </div>
                                <div className="card-body p-4">
                                    {todaySchedule.length === 0 ? (
                                        <div className="text-center py-5">
                                            <i className="bi bi-calendar-x text-muted display-4"></i>
                                            <p className="text-muted mt-3">No classes scheduled for today. Enjoy your day!</p>
                                        </div>
                                    ) : (
                                        <div className="position-relative">
                                            {/* Timeline Line */}
                                            <div className="position-absolute h-100 border-start border-light" style={{ left: "15px", top: "0" }}></div>

                                            {todaySchedule.map((entry, idx) => {
                                                const status = getClassStatus(entry.startTime, entry.endTime);
                                                return (
                                                    <div key={entry._id} className="d-flex mb-4 position-relative" style={{ zIndex: 1 }}>
                                                        <div
                                                            className={`rounded-circle bg-${status === 'Live' ? 'success' : status === 'Completed' ? 'secondary' : 'primary'} mt-2 shadow-sm`}
                                                            style={{ width: "32px", height: "32px", flexShrink: 0, border: "4px solid #fff" }}
                                                        ></div>
                                                        <div className={`card border-0 shadow-sm flex-grow-1 ms-4 ${status === 'Live' ? 'border-start border-success border-4' : ''}`} style={{ borderRadius: "12px", transition: "all 0.3s" }}>
                                                            <div className="card-body p-3">
                                                                <div className="row align-items-center">
                                                                    <div className="col-md-2 text-center text-md-start mb-2 mb-md-0">
                                                                        <div className="fw-bold text-dark">{entry.startTime}</div>
                                                                        <div className="small text-muted">{entry.endTime}</div>
                                                                    </div>
                                                                    <div className="col-md-4 mb-2 mb-md-0">
                                                                        <h6 className="fw-bold mb-0 text-dark">{entry.subjectRef?.name || "Subject"}</h6>
                                                                        <div className="text-primary small fw-bold">{entry.classRef?.name || "Class"}</div>
                                                                    </div>
                                                                    <div className="col-md-2 text-center mb-2 mb-md-0">
                                                                        <span className={`badge rounded-pill px-3 py-2 ${status === 'Live' ? 'bg-success' :
                                                                            status === 'Completed' ? 'bg-secondary text-white' :
                                                                                'bg-light text-primary'
                                                                            }`}>
                                                                            {status === 'Live' && <span className="spinner-grow spinner-grow-sm me-1" role="status"></span>}
                                                                            {status}
                                                                        </span>
                                                                    </div>
                                                                    <div className="col-md-4 text-center text-md-end">
                                                                        <button
                                                                            className={`btn btn-sm ${status === 'Live' ? 'btn-success' : 'btn-outline-primary'} rounded-pill px-3 me-2`}
                                                                            onClick={() => handleMarkAttendance(entry.classRef?._id)}
                                                                        >
                                                                            <i className="bi bi-person-check me-1"></i> Attendance
                                                                        </button>
                                                                        <button
                                                                            className="btn btn-sm btn-outline-dark rounded-pill px-3"
                                                                            onClick={() => router.push(`/dashboard/teacher/assignments?classId=${entry.classRef?._id}`)}
                                                                        >
                                                                            <i className="bi bi-plus-circle me-1"></i> Assignment
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <WeeklyCalendar schedule={weeklySchedule} />
            )}
        </div>
    );
}
