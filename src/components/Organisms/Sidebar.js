"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";

const Sidebar = ({ isOpen = true, onToggle, role = "admin" }) => {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState({});

  // Grouped admin menus
  const adminMenus = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: "bi-grid-1x2-fill",
    },
    {
      title: "Students",
      icon: "bi-people-fill",
      id: "students",
      subItems: [
        {
          title: "All Students",
          path: "/dashboard/admin/students",
          icon: "bi-person-lines-fill",
        },
        {
          title: "Attendance",
          path: "/dashboard/admin/attendance",
          icon: "bi-calendar2-check",
        },
      ],
    },
    {
      title: "Teachers",
      icon: "bi-person-badge",
      id: "teachers",
      subItems: [
        {
          title: "All Teachers",
          path: "/dashboard/admin/teachers",
          icon: "bi-person-video3",
        },
        {
          title: "Attendance",
          path: "/dashboard/admin/teachers/attendance",
          icon: "bi-person-check-fill",
        },
        {
          title: "Staff History",
          path: "/dashboard/admin/teachers/attendance/history",
          icon: "bi-clock-history",
        },
        {
          title: "Payroll (Salaries)",
          path: "/dashboard/admin/payroll",
          icon: "bi-wallet2",
        },
      ],
    },
    {
      title: "Academic",
      icon: "bi-book-half",
      id: "academic",
      subItems: [
        {
          title: "Classes",
          path: "/dashboard/admin/classes",
          icon: "bi-building",
        },
        {
          title: "Subjects",
          path: "/dashboard/admin/subjects",
          icon: "bi-journal-code",
        },
        {
          title: "Timetable",
          path: "/dashboard/admin/timetable",
          icon: "bi-calendar3",
        },
      ],
    },
    {
      title: "Fee Records",
      path: "/dashboard/admin/fees",
      icon: "bi-cash-stack",
    },
    {
      title: "Reports & Analytics",
      path: "/dashboard/admin/reports",
      icon: "bi-bar-chart-fill",
    },
    {
      title: "Notifications",
      path: "/dashboard/admin/notifications",
      icon: "bi-bell",
    },
    {
      title: "Users",
      path: "/dashboard/admin/users",
      icon: "bi-people",
    },
    {
      title: "Profile",
      path: "/dashboard/profile",
      icon: "bi-person-circle",
    },
  ];

  const toggleMenu = (id) => {
    setOpenMenus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    adminMenus.forEach((menu) => {
      if (menu.subItems?.some((sub) => sub.path === pathname)) {
        setOpenMenus((prev) => ({ ...prev, [menu.id]: true }));
      }
    });
  }, [pathname]);

  const renderMenuItem = (menu) => {
    const isDropdown = !!menu.subItems;
    const isExpanded = !!openMenus[menu.id];
    const isActive =
      pathname === menu.path || menu.subItems?.some((s) => s.path === pathname);

    if (isDropdown) {
      return (
        <li className="nav-item" key={menu.id}>
          <div
            onClick={() => toggleMenu(menu.id)}
            className={`nav-link text-white mb-1 py-2 px-3 d-flex align-items-center ${styles.dropdownToggle} ${isActive ? "text-primary fw-bold" : styles.navHover
              }`}
          >
            <i className={`bi ${menu.icon} me-3`}></i>
            <span className="small fw-semibold">{menu.title}</span>
            <i
              className={`bi bi-chevron-down ${styles.dropdownIcon} ${isExpanded ? styles.dropdownIconOpen : ""} ms-auto`}
            ></i>
          </div>
          {isExpanded && (
            <ul className={styles.subMenu}>
              {menu.subItems.map((sub) => (
                <li key={sub.path}>
                  <Link
                    href={sub.path}
                    className={`nav-link text-white py-2 px-2 d-flex align-items-center mb-1 ${styles.subNavLink} ${pathname === sub.path ? styles.activeSubLink : ""
                      }`}
                  >
                    <i
                      className={`bi ${sub.icon} me-2`}
                      style={{ fontSize: "0.9rem" }}
                    ></i>
                    <span>{sub.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
      );
    }

    return (
      <li className="nav-item" key={menu.path}>
        <Link
          href={menu.path}
          className={`nav-link text-white mb-2 py-2 px-3 d-flex align-items-center ${pathname === menu.path
              ? "active bg-primary border-0"
              : styles.navHover
            }`}
          style={pathname === menu.path ? { borderRadius: "10px" } : {}}
        >
          <i className={`bi ${menu.icon} me-3`}></i>
          <span className="small fw-semibold">{menu.title}</span>
        </Link>
      </li>
    );
  };

  return (
    <div
      className={`${styles.sidebar} ${!isOpen ? styles.sidebarHidden : ""} bg-dark text-white p-3 d-flex flex-column`}
    >
      <div className="px-3 mb-3 d-flex justify-content-between align-items-center">
        <Link href="/dashboard">
          <h3 className="fw-bold m-0 text-white">
            <i className="bi bi-mortarboard-fill me-2 text-primary"></i>School
            MS
          </h3>
        </Link>
      </div>
      <hr className="text-secondary mb-3" />

      <ul className="nav nav-pills flex-column mb-auto">
        {/* --- ADMIN & STAFF LINKS --- */}
        {(role === "admin" || role === "staff") &&
          adminMenus.map((menu) => renderMenuItem(menu))}

        {/* --- TEACHER LINKS --- */}
        {role === "teacher" && (
          <>
            <li className="nav-item">
              <Link
                href="/dashboard/teacher"
                className={`nav-link text-white mb-2 py-2 px-3 d-flex align-items-center ${pathname === "/dashboard/teacher" ? "active bg-primary border-0" : styles.navHover}`}
              >
                <i className="bi bi-speedometer2 me-3"></i>
                <span className="small fw-semibold">Teacher Dashboard</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                href="/dashboard/teacher/classes"
                className={`nav-link text-white mb-2 py-2 px-3 d-flex align-items-center ${pathname === "/dashboard/teacher/classes" ? "active bg-primary border-0" : styles.navHover}`}
              >
                <i className="bi bi-building me-3"></i>
                <span className="small fw-semibold">My Classes</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                href="/dashboard/teacher/assignments"
                className={`nav-link text-white mb-2 py-2 px-3 d-flex align-items-center ${pathname === "/dashboard/teacher/assignments" ? "active bg-primary border-0" : styles.navHover}`}
              >
                <i className="bi bi-journal-text me-3"></i>
                <span className="small fw-semibold">Assignments</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                href="/dashboard/teacher/grades"
                className={`nav-link text-white mb-2 py-2 px-3 d-flex align-items-center ${pathname === "/dashboard/teacher/grades" ? "active bg-primary border-0" : styles.navHover}`}
              >
                <i className="bi bi-award me-3"></i>
                <span className="small fw-semibold">Grades</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                href="/dashboard/teacher/timetable"
                className={`nav-link text-white mb-2 py-2 px-3 d-flex align-items-center ${pathname === "/dashboard/teacher/timetable" ? "active bg-primary border-0" : styles.navHover}`}
              >
                <i className="bi bi-calendar3 me-3"></i>
                <span className="small fw-semibold">Timetable</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                href="/dashboard/teacher/attendance"
                className={`nav-link text-white mb-2 py-2 px-3 d-flex align-items-center ${pathname === "/dashboard/teacher/attendance" ? "active bg-primary border-0" : styles.navHover}`}
              >
                <i className="bi bi-calendar-check me-3"></i>
                <span className="small fw-semibold">Student Attendance</span>
              </Link>
            </li>
          </>
        )}

        {/* --- STUDENT & PARENT LINKS --- */}
        {(role === "student" || role === "parent") && (
          <>
            <li className="nav-item">
              <Link
                href="/dashboard/student"
                className={`nav-link text-white mb-2 py-2 px-3 d-flex align-items-center ${pathname === "/dashboard/student" ? "active bg-primary border-0" : styles.navHover}`}
              >
                <i className="bi bi-house-door me-3"></i>
                <span className="small fw-semibold">My Dashboard</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                href="/dashboard/student/assignments"
                className={`nav-link text-white mb-2 py-2 px-3 d-flex align-items-center ${pathname === "/dashboard/student/assignments" ? "active bg-primary border-0" : styles.navHover}`}
              >
                <i className="bi bi-journal-bookmark me-3"></i>
                <span className="small fw-semibold">Assignments</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                href="/dashboard/student/grades"
                className={`nav-link text-white mb-2 py-2 px-3 d-flex align-items-center ${pathname === "/dashboard/student/grades" ? "active bg-primary border-0" : styles.navHover}`}
              >
                <i className="bi bi-award me-3"></i>
                <span className="small fw-semibold">Grades</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                href="/dashboard/student/timetable"
                className={`nav-link text-white mb-2 py-2 px-3 d-flex align-items-center ${pathname === "/dashboard/student/timetable" ? "active bg-primary border-0" : styles.navHover}`}
              >
                <i className="bi bi-calendar3 me-3"></i>
                <span className="small fw-semibold">Timetable</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                href="/dashboard/student/attendance"
                className={`nav-link text-white mb-2 py-2 px-3 d-flex align-items-center ${pathname === "/dashboard/student/attendance" ? "active bg-primary border-0" : styles.navHover}`}
              >
                <i className="bi bi-calendar-check me-3"></i>
                <span className="small fw-semibold">Attendance</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                href="/dashboard/profile"
                className={`nav-link text-white mb-2 py-2 px-3 d-flex align-items-center ${pathname === "/dashboard/profile" ? "active bg-primary border-0" : styles.navHover}`}
              >
                <i className="bi bi-person-circle me-3"></i>
                <span className="small fw-semibold">My Profile</span>
              </Link>
            </li>
          </>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
