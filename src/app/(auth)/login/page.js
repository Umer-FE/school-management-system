"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password. Please try again.");
        setLoading(false);
        return;
      }

      if (res?.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Check your connection.");
      setLoading(false);
    }
  };

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
            School MS
          </h1>
          <p
            className="mb-5"
            style={{ opacity: 0.7, maxWidth: 280, margin: "0 auto" }}
          >
            A complete school management platform built for teachers, students
            &amp; admins.
          </p>

          <div
            className="d-flex flex-column gap-3 mt-4"
            style={{ maxWidth: 280, margin: "0 auto" }}
          >
            {[
              { icon: "bi-people-fill", text: "Role-based access control" },
              { icon: "bi-bar-chart-fill", text: "Analytics &amp; reports" },
              {
                icon: "bi-shield-lock-fill",
                text: "Secure JWT authentication",
              },
            ].map((f) => (
              <div
                key={f.text}
                className="d-flex align-items-center gap-3 text-start"
              >
                <div
                  className="d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  <i className={`bi ${f.icon} text-white`}></i>
                </div>
                <span
                  style={{ opacity: 0.85, fontSize: "0.9rem" }}
                  dangerouslySetInnerHTML={{ __html: f.text }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="auth-right">
        <div className="auth-card fade-in-up">
          <div className="mb-4">
            <h2
              className="fw-bold mb-1"
              style={{ fontSize: "1.7rem", color: "var(--dark)" }}
            >
              Welcome back 👋
            </h2>
            <p
              className="mb-0"
              style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}
            >
              Sign in to your account to continue
            </p>
          </div>

          {error && (
            <div
              className="alert alert-danger border-0 mb-4 d-flex align-items-center gap-2"
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
                    zIndex: 1,
                  }}
                ></i>
                <input
                  type="email"
                  className="form-control form-control-premium"
                  placeholder="name@school.com"
                  style={{ paddingLeft: "2.4rem" }}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
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
                    zIndex: 1,
                  }}
                ></i>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control form-control-premium"
                  placeholder="••••••••"
                  style={{ paddingLeft: "2.4rem", paddingRight: "2.4rem" }}
                  onChange={(e) => setPassword(e.target.value)}
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

            <button
              type="submit"
              className="btn btn-premium w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>{" "}
                  Signing in...
                </>
              ) : (
                <>
                  <i className="bi bi-arrow-right-circle me-2"></i> Sign In
                </>
              )}
            </button>
          </form>

          <p
            className="text-center mt-4 mb-0"
            style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}
          >
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="fw-semibold"
              style={{ color: "var(--primary)" }}
            >
              Create one →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
