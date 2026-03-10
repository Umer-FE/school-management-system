"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react"; // Session hook
import { useRouter } from "next/navigation"; // Router for redirect
import StatCard from "@/components/Molecules/StatCard";
import SchoolChart from "@/components/Molecules/SchoolChart";
import CardSkeleton from "@/components/Molecules/CardSkeleton";
import TableSkeleton from "@/components/Molecules/TableSkeleton";
import styles from "./dashboard.module.css";
import Link from "next/link";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State Management
  const [students, setStudents] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [grossRevenue, setGrossRevenue] = useState(0);
  const [activeTeachers, setActiveTeachers] = useState(0);
  const [totalSalariesPaid, setTotalSalariesPaid] = useState(0);
  const [feeProgress, setFeeProgress] = useState(0);
  const [attendanceProgress, setAttendanceProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  // 1. Authentication Guard
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated") {
      const role = session?.user?.role;
      if (role === "admin" || role === "staff") {
        // Allow them to stay on /dashboard (which acts as the main admin/staff dashboard overview)
        // or redirect them explicitly if needed, but currently this page IS the admin dashboard.
      } else if (role === "teacher") {
        router.replace("/dashboard/teacher");
      } else if (role === "student") {
        router.replace("/dashboard/student");
      } else if (role === "parent") {
        router.replace("/dashboard/parent");
      }
    }
  }, [status, session, router]);

  // 2. Data Fetching Logic
  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchDashboardData = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const currentMonth = "2026-03";

        const [stdRes, feeRes, attRes, teacherRes, payrollRes] =
          await Promise.all([
            fetch("/api/students"),
            fetch("/api/fees"),
            fetch(`/api/attendance?date=${today}`),
            fetch("/api/teachers"),
            fetch(`/api/payroll?month=${currentMonth}`),
          ]);

        const stdData = await stdRes.json();
        const feeData = await feeRes.json();
        const attData = await attRes.json();
        const tData = await teacherRes.json();
        const pData = await payrollRes.json();

        // Data processing logic (Same as yours)
        if (stdData.success) {
          setTotalCount(stdData.data.length);
          setStudents(
            stdData.data.slice(0, 5).map((s) => ({ ...s, id: s._id })),
          );
        }

        if (tData.success) {
          const active = tData.data.filter((t) => t.status === "Active").length;
          setActiveTeachers(active);
        }

        if (feeData.success) {
          const totalFees = feeData.data.reduce((sum, f) => sum + f.amount, 0);
          setGrossRevenue(totalFees);
          const paidThisMonth = feeData.data.filter(
            (f) => f.month === "March 2026",
          ).length;
          setFeeProgress(
            stdData?.data?.length > 0
              ? Math.round((paidThisMonth / stdData.data.length) * 100)
              : 0,
          );
        }

        if (pData.success) {
          const totalPaid = pData.data
            .filter((p) => p.isAlreadyPaid === true)
            .reduce((sum, p) => sum + p.netSalary, 0);
          setTotalSalariesPaid(totalPaid);
        }

        if (attData.success && stdData?.data?.length > 0) {
          const present = attData.data.filter(
            (a) => a.status === "Present",
          ).length;
          setAttendanceProgress(
            Math.round((present / stdData.data.length) * 100),
          );
        }
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className={styles.dashboardContainer}>
        <div className="row g-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="col-md-3"><CardSkeleton /></div>
          ))}
        </div>
        <div className="row mt-5">
          <div className="col-12"><TableSkeleton /></div>
        </div>
      </div>
    );
  }

  const netRevenue = grossRevenue - totalSalariesPaid;

  return (
    <div className={styles.dashboardContainer}>
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-0">
            Hello, {session?.user?.name || "Admin"}!
          </h2>
          <p className="text-muted small">Academic Year 2026-27 Overview</p>
        </div>
        <Link
          href="/dashboard/admin/students"
          className="btn btn-primary shadow-sm px-4"
        >
          <i className="bi bi-plus-lg me-2"></i> New Admission
        </Link>
      </div>

      {/* Main Stats Cards */}
      <div className="row g-4">
        <div className="col-md-3">
          <StatCard
            title="Total Students"
            value={totalCount}
            icon="bi-people-fill"
            bgColor="bg-primary"
            trend="Live"
          />
        </div>
        <div className="col-md-3">
          <StatCard
            title="Active Teachers"
            value={activeTeachers}
            icon="bi-person-workspace"
            bgColor="bg-success"
            trend="Staff"
          />
        </div>
        <div className="col-md-3">
          <StatCard
            title="Gross Revenue"
            value={`Rs. ${grossRevenue.toLocaleString()}`}
            icon="bi-cash-coin"
            bgColor="bg-dark"
            trend="Total Collection"
          />
        </div>
        <div className="col-md-3">
          <StatCard
            title="Net Profit"
            value={`Rs. ${netRevenue.toLocaleString()}`}
            icon="bi-graph-up-arrow"
            bgColor={netRevenue >= 0 ? "bg-info" : "bg-danger"}
            trend="Final"
          />
        </div>
      </div>

      {/* Charts & Summary Row */}
      <div className="row mt-5 g-4">
        <div className="col-lg-8">
          <SchoolChart />
        </div>
        <div className="col-lg-4">
          <div
            className="card border-0 shadow-sm p-4 h-100"
            style={{ borderRadius: "15px" }}
          >
            <h5 className="fw-bold mb-4">Quick Insights</h5>
            <div className="p-3 mb-4 rounded-3 border-start border-4 border-danger bg-light">
              <p className="text-muted mb-0 small fw-bold">SALARY EXPENSE</p>
              <h4 className="fw-bold text-danger mb-0">
                Rs. {totalSalariesPaid.toLocaleString()}
              </h4>
            </div>
            {/* Progress Bars (Attendance & Fees) */}
            <div className="mb-4">
              <p className="text-muted mb-1 small fw-bold">ATTENDANCE</p>
              <div className="progress" style={{ height: "8px" }}>
                <div
                  className="progress-bar bg-info"
                  style={{ width: `${attendanceProgress}%` }}
                ></div>
              </div>
              <small className="d-block mt-2 text-end fw-bold">
                {attendanceProgress}% Present
              </small>
            </div>
            <div className="mb-4">
              <p className="text-muted mb-1 small fw-bold">FEE COLLECTION</p>
              <div className="progress" style={{ height: "8px" }}>
                <div
                  className="progress-bar bg-warning"
                  style={{ width: `${feeProgress}%` }}
                ></div>
              </div>
              <small className="d-block mt-2 text-end fw-bold">
                {feeProgress}% Paid
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className={`card border-0 shadow-sm mt-5 ${styles.tableCard}`}>
        <div className="card-header bg-white py-3 border-0">
          <h5 className="mb-0 fw-bold">Recent Enrollments</h5>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light text-muted">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="py-3">Class</th>
                <th className="text-end px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="px-4 fw-semibold">{student.name}</td>
                  <td className="text-muted">{student.class}</td>
                  <td className="text-end px-4">
                    <Link
                      href="/dashboard/admin/students"
                      className="btn btn-sm btn-light border"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
