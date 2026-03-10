# 🎓 School Management System

A full-stack, role-based school management platform built with **Next.js 14**, **MongoDB**, and **NextAuth.js**. Manage students, teachers, classes, grades, attendance, and more — all from a single unified dashboard.

---

## ✨ Features

### 🔐 Authentication & Authorization
- Secure **JWT-based login** via NextAuth.js
- **Role-Based Access Control (RBAC)** with 5 roles: `Admin`, `Staff`, `Teacher`, `Student`, `Parent`
- Middleware-enforced route protection for both pages and APIs

### 🏫 Admin Dashboard
- Overview stats: enrolled students, active teachers, total classes
- User management (CRUD) — create, edit, delete users
- Class & subject management
- Fee records & payroll management
- Notification broadcasting to all users
- Reports & analytics with charts

### 👨‍🏫 Teacher Dashboard
- View personal assignments (created by self)
- Grading status — track which assignments still need grading
- Mark student attendance
- View today's timetable / schedule
- Real-time dynamic stats from the database

### 🎒 Student / Parent Dashboard
- View personal grades and assignment results
- Check class timetable
- View attendance records
- Read school notifications

### 🔔 Notifications
- Admin/Staff can broadcast announcements
- Bell icon badge shows **unread count**
- Badge disappears after visiting the Notifications page (tracked via `localStorage`)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| Auth | [NextAuth.js](https://next-auth.js.org/) with CredentialsProvider |
| Database | [MongoDB Atlas](https://www.mongodb.com/atlas) via Mongoose |
| Styling | Bootstrap 5 + Custom CSS (Inter font) |
| Icons | Bootstrap Icons |
| Language | JavaScript (ES2022+) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- npm / yarn

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/school-management-system.git
cd school-management-system

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/school_db
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

### Running the App

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 👥 User Roles & Permissions

| Feature | Admin | Staff | Teacher | Student | Parent |
|---------|-------|-------|---------|---------|--------|
| User Management | ✅ | ✅ | ❌ | ❌ | ❌ |
| Class/Subject Mgmt | ✅ | ✅ | ❌ | ❌ | ❌ |
| Grade Entry | ✅ | ✅ | ✅ | ❌ | ❌ |
| Assignment Create | ✅ | ✅ | ✅ | ❌ | ❌ |
| Attendance Mark | ✅ | ✅ | ✅ | ❌ | ❌ |
| Broadcast Notifications | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| View own Grades | — | — | — | ✅ | ✅ |
| Fee/Payroll Mgmt | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/          # Login page
│   │   └── signup/         # Signup page (with role selection)
│   ├── api/
│   │   ├── auth/           # NextAuth + Signup endpoint
│   │   ├── students/       # Student CRUD API
│   │   ├── teachers/       # Teacher CRUD API
│   │   ├── classes/        # Class CRUD API
│   │   ├── grades/         # Grades CRUD API
│   │   ├── assignments/    # Assignment CRUD API
│   │   ├── attendance/     # Attendance CRUD API
│   │   ├── timetable/      # Timetable CRUD API
│   │   ├── notifications/  # Notifications API
│   │   └── fees/           # Fee Records API
│   └── dashboard/
│       ├── page.js         # Admin dashboard
│       ├── teacher/        # Teacher dashboard & pages
│       ├── student/        # Student dashboard & pages
│       ├── parent/         # Parent view
│       ├── admin/          # All admin management pages
│       └── notifications/  # Shared notifications (non-admin)
├── components/
│   ├── Atoms/              # DataTable, CustomModal
│   ├── Molecules/          # FormInput, StatCard
│   └── Organisms/          # Sidebar
├── models/                 # Mongoose models (User, Student, Teacher, etc.)
├── lib/
│   └── mongodb.js          # MongoDB connection helper
└── middleware.js           # NextAuth RBAC middleware
```

---

## 🔧 Key Design Decisions

- **Dual-collection strategy**: Users login via the `User` collection; detailed profiles (Student/Teacher) are in separate collections — merged at the API level.
- **Upsert on edit**: When an Admin edits a registered user for the first time, the system creates a proper profile automatically using `findOneAndUpdate` with `upsert: true`.
- **Middleware-level RBAC**: All route and API protection is enforced in `src/middleware.js`, not inside individual route handlers.
- **Notification read tracking**: Uses `localStorage` to track `notifLastSeen` timestamp — shows unread count only for notifications newer than last visit.

---

## 📄 License

MIT © 2026 — Built as a learning project with Next.js App Router.
