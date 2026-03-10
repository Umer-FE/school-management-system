"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Organisms/Sidebar";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import "bootstrap-icons/font/bootstrap-icons.css";
import styles from "./dashboard.module.css";

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notifCount, setNotifCount] = useState(0);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const computeCount = async () => {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        if (data.success) {
          const lastSeen = localStorage.getItem("notifLastSeen");
          const unseen = lastSeen
            ? data.data.filter(
                (n) => new Date(n.createdAt) > new Date(lastSeen),
              ).length
            : data.data.length;
          setNotifCount(unseen);
        }
      } catch {}
    };
    computeCount();

    const handleRead = () => setNotifCount(0);
    window.addEventListener("notifRead", handleRead);
    return () => window.removeEventListener("notifRead", handleRead);
  }, []);

  if (status === "loading") {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        Loading...
      </div>
    );
  }

  const userName = session?.user?.name || "User";
  const userRole = session?.user?.role || "admin";

  return (
    <section
      className="d-flex"
      style={{ minHeight: "100vh", overflowX: "hidden" }}
    >
      <div className={`sidebar-wrapper ${!isSidebarOpen ? "collapsed" : ""}`}>
        <Sidebar
          role={userRole}
          isOpen={isSidebarOpen}
          // userId={userId}
          onToggle={() => setIsSidebarOpen((prev) => !prev)}
        />
      </div>

      {/* 2. Main Content Area */}
      <main className="flex-grow-1 d-flex flex-column bg-light">
        {/* Navbar with Toggle & Logout */}
        <nav className="navbar navbar-light bg-white shadow-sm px-4 py-3 sticky-top">
          <div className="container-fluid p-0 d-flex justify-content-between">
            <div className="d-flex align-items-center">
              <button
                className="custom_sidebar_btn btn btn-outline-primary me-2 rounded-circle d-flex align-items-center justify-content-center"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <i
                  className={`bi ${
                    isSidebarOpen ? "bi-layout-sidebar-inset" : "bi-list"
                  }`}
                ></i>
              </button>
              <span className="navbar-brand fw-bold m-0 text-primary">
                School <span className="text-dark">MS</span>
              </span>
            </div>

            {/* Logout and User Info Section */}
            <div className="d-flex align-items-center gap-4">
              {/* Notification Bell — clickable, red dot only when notifications exist */}
              <button
                className="btn p-0 border-0 bg-transparent position-relative"
                onClick={() => {
                  if (userRole === "admin" || userRole === "staff") {
                    router.push("/dashboard/admin/notifications");
                  } else {
                    router.push("/dashboard/notifications");
                  }
                }}
                title="Notifications"
              >
                <i
                  className={`bi ${notifCount > 0 ? "bi-bell-fill text-danger" : "bi-bell text-secondary"} fs-5`}
                ></i>
                {notifCount > 0 && (
                  <span
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                    style={{ fontSize: "0.55rem" }}
                  >
                    {notifCount > 99 ? "99+" : notifCount}
                  </span>
                )}
              </button>

              <span className="text-muted small d-none d-md-inline border-start ps-3">
                Welcome, <b>{userName}</b>
              </span>
              <button
                className="btn btn-outline-danger btn-sm px-3 rounded-pill"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <i className="bi bi-box-arrow-right me-1"></i> Logout
              </button>
            </div>
          </div>
        </nav>

        {/* 3. Dynamic Page Content */}
        <div className="p-3 p-md-4">{children}</div>
      </main>

      <style jsx>{`
        .sidebar-wrapper {
          width: 260px;
          height: 100vh;
          flex-shrink: 0;
          transition: width 0.3s ease;
        }
        .sidebar-wrapper.collapsed {
          width: 0;
        }
      `}</style>
    </section>
  );
}
