import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware() { },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (!token) return false;

        const path = req.nextUrl.pathname;
        const method = req.method;
        const isMutation = ["POST", "PUT", "DELETE", "PATCH"].includes(method);

        // ----------------------------------------------------
        // PAGE ROUTES PROTECTION
        // ----------------------------------------------------

        // Shared pages — any authenticated user can access
        if (path === "/dashboard/notifications") {
          return !!token;
        }

        // Admin/Staff area
        if (path.startsWith("/dashboard/admin")) {
          return token.role === "admin" || token.role === "staff";
        }

        // Teacher area
        if (path.startsWith("/dashboard/teacher")) {
          return token.role === "teacher";
        }

        // Student & Parent area
        if (path.startsWith("/dashboard/student") || path.startsWith("/dashboard/parent")) {
          return token.role === "student" || token.role === "parent";
        }

        // ----------------------------------------------------
        // API ROUTES PROTECTION
        // ----------------------------------------------------

        if (path.startsWith("/api/")) {

          // Administrative Mutations: User Management, Fees, Staff, System
          const adminStaffMutations = [
            "/api/students",
            "/api/teachers",
            "/api/users",
            "/api/fees",
            "/api/payroll"
          ];

          // Academic Mutations: Classes, Subjects, Grades, Attendance, Assignments
          const adminTeacherMutations = [
            "/api/classes",
            "/api/subjects",
            "/api/assignments",
            "/api/grades",
            "/api/attendance"
          ];

          // Timetable Mutations: Admin, Staff, Teacher
          const timetableMutations = [
            "/api/timetable"
          ];

          // Communication/Messaging Mutations: All roles can theoretically send messages, 
          // but if it's broadcasting Notifications, we can restrict to Admin/Staff
          const broadcastMutations = [
            "/api/notifications"
          ];

          if (isMutation) {
            // Check Administrative routes
            for (const route of adminStaffMutations) {
              if (path.startsWith(route)) {
                return token.role === "admin" || token.role === "staff";
              }
            }

            // Check Academic routes
            for (const route of adminTeacherMutations) {
              if (path.startsWith(route)) {
                return token.role === "admin" || token.role === "teacher";
              }
            }

            // Check Timetable
            for (const route of timetableMutations) {
              if (path.startsWith(route)) {
                return token.role === "admin" || token.role === "staff" || token.role === "teacher";
              }
            }

            // Check Broadcasts
            for (const route of broadcastMutations) {
              if (path.startsWith(route)) {
                return token.role === "admin" || token.role === "staff" || token.role === "teacher";
              }
            }
          }

          // GET requests to protected API routes are generally allowed for all authenticated users to view
          return true;
        }

        // General dashboard/profile accessible to any logged-in user
        return true;
      },
    },
    pages: {
      signIn: "/login",
    },
  },
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/students/:path*",
    "/api/teachers/:path*",
    "/api/users/:path*",
    "/api/classes/:path*",
    "/api/subjects/:path*",
    "/api/timetable/:path*",
    "/api/fees/:path*",
    "/api/payroll/:path*",
    "/api/notifications/:path*",
    "/api/assignments/:path*",
    "/api/grades/:path*",
    "/api/attendance/:path*"
  ],
};
