"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/login");
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.message || "Registration failed.");
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      value: "admin",
      label: "Admin",
      icon: "bi-shield-fill",
      desc: "Full system access",
    },
    {
      value: "teacher",
      label: "Teacher",
      icon: "bi-person-badge-fill",
      desc: "Manage classes & grades",
    },
    {
      value: "student",
      label: "Student",
      icon: "bi-mortarboard-fill",
      desc: "View my academic info",
    },
    // { value: "parent", label: "Parent", icon: "bi-house-heart-fill", desc: "Track child's progress" },
    // { value: "staff", label: "Staff", icon: "bi-person-gear", desc: "Administrative tasks" },
  ];

  return (
    <div className="auth-wrapper">
      {/* ── Left Panel ── */}
      <div className="auth-left">
        <div
          className="text-center text-white"
          style={{ position: "relative", zIndex: 1 }}
        >
          <div
            className="d-inline-flex align-items-center justify-content-center mb-4"
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              boxShadow: "0 8px 32px rgba(99,102,241,0.5)",
            }}
          >
            <i className="bi bi-mortarboard-fill fs-2 text-white"></i>
          </div>
          <h1 className="fw-bold mb-2" style={{ fontSize: "2.2rem" }}>
            Join School MS
          </h1>
          <p style={{ opacity: 0.7, maxWidth: 280, margin: "0 auto 2rem" }}>
            Create your account and get access to your personal school
            dashboard.
          </p>

          <div
            className="d-flex flex-column gap-2"
            style={{ maxWidth: 260, margin: "0 auto" }}
          >
            {[
              "Students • Assignment tracking",
              "Teachers • Grade management",
              "Admins • Full system control",
            ].map((t) => (
              <div
                key={t}
                className="badge-float text-start d-flex align-items-center gap-2"
              >
                <i
                  className="bi bi-check-circle-fill"
                  style={{ color: "#10b981" }}
                ></i>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="auth-right">
        <div className="auth-card fade-in-up" style={{ maxWidth: 460 }}>
          <div className="mb-4">
            <h2
              className="fw-bold mb-1"
              style={{ fontSize: "1.7rem", color: "var(--dark)" }}
            >
              Create account
            </h2>
            <p
              className="mb-0"
              style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}
            >
              Fill in your details to get started
            </p>
          </div>

          {error && (
            <div
              className="alert alert-danger border-0 mb-3 d-flex align-items-center gap-2"
              style={{
                borderRadius: "var(--radius-sm)",
                fontSize: "0.875rem",
                padding: "10px 14px",
              }}
            >
              <i className="bi bi-exclamation-circle-fill"></i> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="fade-in-up-delay">
            {/* Name */}
            <div className="mb-3">
              <label
                className="form-label fw-semibold mb-1"
                style={{ fontSize: "0.85rem", color: "#334155" }}
              >
                Full Name
              </label>
              <div className="position-relative">
                <i
                  className="bi bi-person position-absolute"
                  style={{
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                  }}
                ></i>
                <input
                  type="text"
                  className="form-control form-control-premium"
                  placeholder="Your full name"
                  style={{ paddingLeft: "2.4rem" }}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-3">
              <label
                className="form-label fw-semibold mb-1"
                style={{ fontSize: "0.85rem", color: "#334155" }}
              >
                Email Address
              </label>
              <div className="position-relative">
                <i
                  className="bi bi-envelope position-absolute"
                  style={{
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                  }}
                ></i>
                <input
                  type="email"
                  className="form-control form-control-premium"
                  placeholder="name@school.com"
                  style={{ paddingLeft: "2.4rem" }}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-3">
              <label
                className="form-label fw-semibold mb-1"
                style={{ fontSize: "0.85rem", color: "#334155" }}
              >
                Password
              </label>
              <div className="position-relative">
                <i
                  className="bi bi-lock position-absolute"
                  style={{
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                  }}
                ></i>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control form-control-premium"
                  placeholder="Min 8 characters"
                  style={{ paddingLeft: "2.4rem", paddingRight: "2.4rem" }}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
                <button
                  type="button"
                  className="btn p-0 border-0 bg-transparent position-absolute"
                  style={{
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                  }}
                  onClick={() => setShowPassword((p) => !p)}
                  tabIndex={-1}
                >
                  <i
                    className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                  ></i>
                </button>
              </div>
            </div>

            {/* Role selector */}
            <div className="mb-4">
              <label
                className="form-label fw-semibold mb-2"
                style={{ fontSize: "0.85rem", color: "#334155" }}
              >
                Select Your Role
              </label>
              <div className="d-flex flex-wrap gap-2">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    className="d-flex align-items-center gap-2"
                    onClick={() => setFormData({ ...formData, role: r.value })}
                    style={{
                      border: `1.5px solid ${formData.role === r.value ? "var(--primary)" : "var(--border)"}`,
                      borderRadius: "var(--radius-sm)",
                      padding: "7px 12px",
                      background:
                        formData.role === r.value
                          ? "rgba(79,70,229,0.06)"
                          : "#fafafa",
                      color:
                        formData.role === r.value
                          ? "var(--primary)"
                          : "#64748b",
                      cursor: "pointer",
                      fontSize: "0.82rem",
                      fontWeight: 500,
                      transition: "all 0.15s ease",
                    }}
                  >
                    <i className={`bi ${r.icon}`}></i> {r.label}
                  </button>
                ))}
              </div>
              {formData.role && (
                <p
                  className="mt-2 mb-0"
                  style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}
                >
                  <i className="bi bi-info-circle me-1"></i>
                  {roles.find((r) => r.value === formData.role)?.desc}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-premium w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>{" "}
                  Creating account...
                </>
              ) : (
                <>
                  <i className="bi bi-person-plus me-2"></i> Create Account
                </>
              )}
            </button>
          </form>

          <p
            className="text-center mt-4 mb-0"
            style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}
          >
            Already have an account?{" "}
            <Link
              href="/login"
              className="fw-semibold"
              style={{ color: "var(--primary)" }}
            >
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
