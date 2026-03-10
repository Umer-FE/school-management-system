"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { showSuccess, showError, showConfirm } from "@/lib/swal";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const fileInputRef = useRef(null);
  const editModalRef = useRef(null);
  const passModalRef = useRef(null);

  // Password visibility states
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [settings, setSettings] = useState({
    notifications: true,
    publicProfile: false,
    twoFactor: false,
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    phone: "",
    qualification: "",
    gender: "",
    image: "",
  });

  const [passData, setPassData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      const json = await res.json();
      if (json.success) {
        setUserData(json.data);
        setEditFormData({
          name: json.data.name || "",
          phone: json.data.profile?.phone || "",
          qualification:
            json.data.role === "teacher"
              ? json.data.profile?.qualification || ""
              : "",
          gender:
            json.data.role === "student" ? json.data.profile?.gender || "" : "",
          image: json.data.image || "",
        });
      }
    } catch (err) {
      console.error("Profile Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showEditModal &&
        editModalRef.current &&
        !editModalRef.current.contains(event.target)
      ) {
        setShowEditModal(false);
      }
      if (
        showPassModal &&
        passModalRef.current &&
        !passModalRef.current.contains(event.target)
      ) {
        setShowPassModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEditModal, showPassModal]);

  const handleEditSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });
      const json = await res.json();
      if (json.success) {
        showSuccess("Updated!", "Your profile has been synchronized.");
        setShowEditModal(false);
        fetchProfile();
      } else {
        showError("Ups!", json.error || "Failed to update profile");
      }
    } catch (err) {
      showError("Error", "Internal server error");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        // 1MB limit for base64
        return showError(
          "File too large",
          "Please upload an image smaller than 1MB",
        );
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setEditFormData((prev) => ({ ...prev, image: base64String }));
        // Automatically save image
        setTimeout(() => {
          submitImageUpdate(base64String);
        }, 100);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitImageUpdate = async (imgBase64) => {
    try {
      setLoading(true);
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editFormData, image: imgBase64 }),
      });
      const json = await res.json();
      if (json.success) {
        showSuccess(
          "Identity Updated",
          "Profile picture changed successfully!",
        );
        // Update local state immediately
        setUserData((prev) => (prev ? { ...prev, image: imgBase64 } : null));
        fetchProfile();
      }
    } catch (err) {
      showError("Upload Failed", "Could not save image");
    } finally {
      setLoading(false);
    }
  };

  const handlePassSubmit = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      return showError("Mismatch", "New passwords do not match!");
    }
    try {
      setLoading(true);
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passData.currentPassword,
          newPassword: passData.newPassword,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showSuccess("Secured!", "Your password has been changed successfully.");
        setShowPassModal(false);
        setPassData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        // Reset visibility
        setShowCurrentPass(false);
        setShowNewPass(false);
        setShowConfirmPass(false);
      } else {
        showError(
          "Authentication Failed",
          json.error || "Incorrect current password",
        );
      }
    } catch (err) {
      showError("Error", "Security update failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    const titles = {
      notifications: "Alerts",
      publicProfile: "Visibility",
      twoFactor: "Security",
    };
    showSuccess(
      "Setting Updated",
      `${titles[key]} is now ${!settings[key] ? "Enabled" : "Disabled"}`,
    );
  };

  if (status === "loading" || loading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center bg-white">
        <div
          className="spinner-grow text-primary"
          role="status"
          style={{ width: "3rem", height: "3rem" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const user = userData || session?.user;
  const profile = userData?.profile;

  return (
    <div className="profile-container min-vh-100 pb-5">
      <input
        type="file"
        ref={fileInputRef}
        className="d-none"
        accept="image/*"
        onChange={handleImageUpload}
      />

      {/* Dynamic Cover Section */}
      <div className="profile-cover">
        <div className="cover-overlay"></div>
        <div className="container-lg h-100 position-relative">
          <div className="d-flex align-items-end h-100 pb-4">
            <div className="avatar-wrapper shadow-lg">
              <div className="avatar-content overflow-hidden">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt="Profile"
                    className="w-100 h-100 object-fit-cover"
                  />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase() || "U"
                )}
              </div>
              <button
                className="btn btn-sm btn-light rounded-circle edit-avatar"
                onClick={() => fileInputRef.current.click()}
              >
                <i className="bi bi-camera-fill"></i>
              </button>
            </div>
            <div className="ms-4 mb-2 text-white">
              <h1 className="fw-900 mb-0 display-6 tracking-tight">
                {user?.name}
              </h1>
              <div className="d-flex gap-2 align-items-center opacity-90 mt-1">
                <span className="badge glass-badge px-3 py-1 text-uppercase">
                  {user?.role}
                </span>
                <span className="small fw-semibold">
                  • Joined{" "}
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })
                    : "2024"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-lg mt-n5 position-relative z-3 mt-5">
        <div className="row g-4">
          {/* Main Info Card */}
          <div className="col-lg-8">
            <div
              className="card border-0 shadow-premium"
              style={{ borderRadius: "24px" }}
            >
              <div className="card-body p-4 p-md-5">
                <div className="d-flex justify-content-between align-items-center mb-5">
                  <h4 className="fw-800 mb-0 d-flex align-items-center">
                    <span className="icon-box me-3">
                      <i className="bi bi-person-vcard text-primary"></i>
                    </span>
                    Account Identity
                  </h4>
                  <button
                    className="btn btn-primary-premium rounded-pill px-4 py-2"
                    onClick={() => setShowEditModal(true)}
                  >
                    <i className="bi bi-pencil-square me-2"></i> Edit Profile
                  </button>
                </div>

                <div className="row g-4">
                  <div className="col-md-6 mb-3">
                    <label className="text-muted extra-small fw-bold text-uppercase tracking-wider mb-2">
                      Primary Email
                    </label>
                    <div className="info-box py-3 px-4 rounded-4 bg-light fw-bold text-dark text-break">
                      {user?.email}
                      <span className="float-end text-success">
                        <i className="bi bi-patch-check-fill"></i>
                      </span>
                    </div>
                  </div>

                  {user?.role === "teacher" && (
                    <>
                      <div className="col-md-6 mb-3">
                        <label className="text-muted extra-small fw-bold text-uppercase tracking-wider mb-2">
                          Academic Subject
                        </label>
                        <div className="info-box py-3 px-4 rounded-4 bg-primary-soft fw-800 text-primary">
                          {profile?.subject}
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="text-muted extra-small fw-bold text-uppercase tracking-wider mb-2">
                          Qualification
                        </label>
                        <div className="info-box py-3 px-4 rounded-4 bg-light fw-bold">
                          {profile?.qualification}
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="text-muted extra-small fw-bold text-uppercase tracking-wider mb-2">
                          Work Phone
                        </label>
                        <div className="info-box py-3 px-4 rounded-4 bg-light fw-bold">
                          {profile?.phone}
                        </div>
                      </div>
                    </>
                  )}

                  {user?.role === "student" && (
                    <>
                      <div className="col-md-6 mb-3">
                        <label className="text-muted extra-small fw-bold text-uppercase tracking-wider mb-2">
                          Assigned Class
                        </label>
                        <div className="info-box py-3 px-4 rounded-4 bg-primary-soft fw-800 text-primary">
                          {profile?.class || profile?.classId?.name}
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="text-muted extra-small fw-bold text-uppercase tracking-wider mb-2">
                          Gender Category
                        </label>
                        <div className="info-box py-3 px-4 rounded-4 bg-light fw-bold text-capitalize">
                          {profile?.gender}
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="text-muted extra-small fw-bold text-uppercase tracking-wider mb-2">
                          Emergency Contact
                        </label>
                        <div className="info-box py-3 px-4 rounded-4 bg-light fw-bold">
                          {profile?.phone}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-5 pt-4 border-top border-light">
                  <div className="d-flex align-items-center justify-content-between p-4 bg-gradient-light rounded-4">
                    <div className="d-flex align-items-center">
                      <div className="status-indicator active me-3 pulse"></div>
                      <div>
                        <div className="fw-800 text-dark small">
                          Current Status: Active
                        </div>
                        <div className="text-muted extra-small">
                          Account fully verified and online
                        </div>
                      </div>
                    </div>
                    <span className="badge bg-white text-dark shadow-sm rounded-pill px-3 py-2 border">
                      ID: SMS-{user?._id?.slice(-6).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Settings */}
          <div className="col-lg-4">
            <div
              className="card border-0 shadow-premium mb-4"
              style={{ borderRadius: "24px" }}
            >
              <div className="card-body p-4">
                <h5 className="fw-800 mb-4 d-flex align-items-center">
                  <i className="bi bi-shield-lock-fill text-danger me-2"></i>{" "}
                  Security Suite
                </h5>

                <div className="d-grid mb-4">
                  <button
                    className="btn btn-outline-danger-premium py-3 rounded-4 fw-bold"
                    onClick={() => setShowPassModal(true)}
                  >
                    <i className="bi bi-key-fill me-2"></i> Update Security
                    Credentials
                  </button>
                </div>

                <div className="settings-list">
                  <div className="setting-item py-3 d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold small">Direct App Alerts</div>
                      <div className="text-muted extra-small">
                        Real-time browser notifications
                      </div>
                    </div>
                    <div className="form-check form-switch custom-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={settings.notifications}
                        onChange={() => toggleSetting("notifications")}
                      />
                    </div>
                  </div>

                  <div className="setting-item py-3 d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold small">Campus Directory</div>
                      <div className="text-muted extra-small">
                        Allow staff to find your contact
                      </div>
                    </div>
                    <div className="form-check form-switch custom-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={settings.publicProfile}
                        onChange={() => toggleSetting("publicProfile")}
                      />
                    </div>
                  </div>

                  <div className="setting-item py-3 d-flex justify-content-between align-items-center border-bottom-0">
                    <div>
                      <div className="fw-bold small">Two-Factor Auth</div>
                      <div className="text-muted extra-small">
                        Shield with OTP protection
                      </div>
                    </div>
                    <div className="form-check form-switch custom-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={settings.twoFactor}
                        onChange={() => toggleSetting("twoFactor")}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="card border-0 bg-danger shadow-premium"
              style={{
                borderRadius: "24px",
                background: "linear-gradient(45deg, #FF4B2B, #FF416C)",
              }}
            >
              <div className="card-body p-4 text-white">
                <h5 className="fw-bold mb-3">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>{" "}
                  Danger Zone
                </h5>
                <p className="extra-small opacity-90 mb-4">
                  Deactivating your account will immediately revoke access to
                  all campus resources. This action requires approval from the
                  Registrar.
                </p>
                <button
                  className="btn btn-glass-danger w-100 py-2 rounded-pill fw-bold"
                  onClick={() =>
                    showConfirm(
                      "Account Deactivation",
                      "This will suspend your access until manually restored by MD. Proceed?",
                      () =>
                        showSuccess(
                          "Request Sent",
                          "Admin will review your request.",
                        ),
                    )
                  }
                >
                  Request Deactivation
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-5 mb-3">
          <div className="d-flex justify-content-center gap-3 mb-2 opacity-50">
            <i className="bi bi-github pointer"></i>
            <i className="bi bi-twitter pointer"></i>
            <i className="bi bi-linkedin pointer"></i>
          </div>
          <p className="extra-small text-muted">
            Platinum v2.3 • Secure Identity Hub
          </p>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div
          className="modal d-block modal-premium"
          style={{
            backgroundColor: "rgba(10,10,25,0.7)",
            backdropFilter: "blur(12px)",
            zIndex: 1050,
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content border-0 shadow-premium-lg"
              style={{ borderRadius: "28px" }}
              ref={editModalRef}
            >
              <div className="modal-header border-0 pt-4 px-4 pb-0">
                <div>
                  <h4 className="modal-title fw-900 text-primary">
                    Identity Profile
                  </h4>
                  <p className="text-muted small mb-0">
                    Update your campus presence details
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-close-custom"
                  onClick={() => setShowEditModal(false)}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label text-muted extra-small fw-800 text-uppercase mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        className="form-control-premium p-3 rounded-4"
                        value={editFormData.name}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            name: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label text-muted extra-small fw-800 text-uppercase mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        className="form-control-premium p-3 rounded-4"
                        value={editFormData.phone}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            phone: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    {user?.role === "teacher" && (
                      <div className="col-12">
                        <label className="form-label text-muted extra-small fw-800 text-uppercase mb-1">
                          Qualification
                        </label>
                        <input
                          type="text"
                          className="form-control-premium p-3 rounded-4"
                          value={editFormData.qualification}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              qualification: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    )}
                    {user?.role === "student" && (
                      <div className="col-12">
                        <label className="form-label text-muted extra-small fw-800 text-uppercase mb-1">
                          Gender
                        </label>
                        <select
                          className="form-select-premium p-3 rounded-4"
                          value={editFormData.gender}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              gender: e.target.value,
                            })
                          }
                          required
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer border-0 pb-4 px-4">
                  <button
                    type="submit"
                    className="btn btn-primary-premium w-100 py-3 fw-bold rounded-pill shadow-lg"
                  >
                    Update My Identity
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Updated Password Modal */}
      {showPassModal && (
        <div
          className="modal d-block"
          style={{
            backgroundColor: "rgba(10,10,25,0.8)",
            backdropFilter: "blur(16px)",
            zIndex: 1060,
          }}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: "450px" }}
          >
            <div
              className="modal-content border-0 shadow-premium-lg overflow-hidden"
              style={{ borderRadius: "32px", background: "#fff" }}
              ref={passModalRef}
            >
              <div className="modal-header border-0 pt-5 px-4 pb-0 text-center d-block position-relative">
                <button
                  type="button"
                  className="btn-close-custom position-absolute end-0 top-0 mt-3 me-3"
                  onClick={() => setShowPassModal(false)}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
                <div className="icon-badge bg-danger-soft text-danger mb-3 mx-auto shadow-sm">
                  <i className="bi bi-shield-lock-fill"></i>
                </div>
                <h3 className="modal-title fw-900 tracking-tight text-dark mb-1">
                  Security Vault
                </h3>
                <p className="text-muted small fw-600">
                  Rotation of security keys is mandatory
                </p>
              </div>

              <form onSubmit={handlePassSubmit}>
                <div className="modal-body p-4 px-md-5">
                  <div className="mb-4">
                    <label className="form-label text-muted extra-small fw-800 text-uppercase tracking-wider mb-2 ms-1">
                      Old Security Key
                    </label>
                    <div className="position-relative">
                      <input
                        type={showCurrentPass ? "text" : "password"}
                        className="form-control-premium-lg p-3 pe-5"
                        value={passData.currentPassword}
                        onChange={(e) =>
                          setPassData({
                            ...passData,
                            currentPassword: e.target.value,
                          })
                        }
                        required
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="btn bg-transparent border-0 position-absolute end-0 top-50 translate-middle-y text-muted me-2"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                      >
                        <i
                          className={`bi bi-eye${showCurrentPass ? "-slash" : ""}-fill`}
                        ></i>
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label text-muted extra-small fw-800 text-uppercase tracking-wider mb-2 ms-1">
                      New Security Key
                    </label>
                    <div className="position-relative">
                      <input
                        type={showNewPass ? "text" : "password"}
                        className="form-control-premium-lg p-3 pe-5"
                        value={passData.newPassword}
                        onChange={(e) =>
                          setPassData({
                            ...passData,
                            newPassword: e.target.value,
                          })
                        }
                        required
                        placeholder="Min 8 characters"
                      />
                      <button
                        type="button"
                        className="btn bg-transparent border-0 position-absolute end-0 top-50 translate-middle-y text-muted me-2"
                        onClick={() => setShowNewPass(!showNewPass)}
                      >
                        <i
                          className={`bi bi-eye${showNewPass ? "-slash" : ""}-fill`}
                        ></i>
                      </button>
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="form-label text-muted extra-small fw-800 text-uppercase tracking-wider mb-2 ms-1">
                      Confirm Identity Key
                    </label>
                    <div className="position-relative">
                      <input
                        type={showConfirmPass ? "text" : "password"}
                        className="form-control-premium-lg p-3 pe-5"
                        value={passData.confirmPassword}
                        onChange={(e) =>
                          setPassData({
                            ...passData,
                            confirmPassword: e.target.value,
                          })
                        }
                        required
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="btn bg-transparent border-0 position-absolute end-0 top-50 translate-middle-y text-muted me-2"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                      >
                        <i
                          className={`bi bi-eye${showConfirmPass ? "-slash" : ""}-fill`}
                        ></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-0 pb-5 px-4 px-md-5">
                  <button
                    type="submit"
                    className="btn btn-vibrant-gradient w-100 py-3 fw-900 rounded-4 shadow-orange transition-all"
                  >
                    Commit Change
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@500;700;900&display=swap");

        .profile-container {
          font-family: "Plus Jakarta Sans", sans-serif;
          background-color: #f8fafc;
          color: #1e293b;
          overflow-x: hidden;
        }

        .fw-800 {
          font-weight: 800;
        }
        .fw-900 {
          font-weight: 900;
        }
        .extra-small {
          font-size: 0.7rem;
        }
        .tracking-wider {
          letter-spacing: 0.12em;
        }
        .tracking-tight {
          letter-spacing: -0.03em;
        }

        .profile-cover {
          height: 400px;
          background: linear-gradient(
            135deg,
            #4f46e5 0%,
            #7e22ce 50%,
            #db2777 100%
          );
          position: relative;
          border-radius: 0 0 60px 60px;
        }

        .cover-overlay {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(
            circle at 2px 2px,
            rgba(255, 255, 255, 0.05) 1px,
            transparent 0
          );
          background-size: 24px 24px;
        }

        .avatar-wrapper {
          width: 150px;
          height: 150px;
          border: 8px solid #fff;
          border-radius: 40px;
          background: #fff;
          position: relative;
          transform: translateY(25px);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
        }

        .avatar-content {
          width: 100%;
          height: 100%;
          border-radius: 32px;
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 4rem;
          font-weight: 900;
          font-family: "Outfit", sans-serif;
        }

        .edit-avatar {
          position: absolute;
          bottom: -8px;
          right: -8px;
          width: 44px;
          height: 44px;
          border: 4px solid #fff;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          color: #4f46e5;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }

        .edit-avatar:hover {
          transform: scale(1.1);
          color: #4338ca;
        }

        .glass-badge {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          font-weight: 700;
          font-size: 12px;
          letter-spacing: 0.05em;
        }

        .shadow-premium {
          box-shadow:
            0 4px 6px -1px rgba(0, 0, 0, 0.05),
            0 20px 25px -5px rgba(0, 0, 0, 0.05);
        }

        .shadow-premium-lg {
          box-shadow: 0 25px 70px -15px rgba(0, 0, 0, 0.2);
        }

        .shadow-orange {
          box-shadow: 0 10px 25px -5px rgba(255, 75, 43, 0.4);
        }

        .icon-box {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
        }

        .bg-primary-soft {
          background-color: #f0f4ff;
        }
        .bg-danger-soft {
          background-color: #fff1f2;
        }

        .btn-primary-premium {
          background: #4f46e5;
          color: white;
          border: none;
          font-weight: 700;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .btn-primary-premium:hover {
          transform: translateY(-2px);
          background: #4338ca;
          box-shadow: 0 10px 20px -5px rgba(79, 70, 229, 0.3);
        }

        .btn-vibrant-gradient {
          background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
          border: none;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .btn-vibrant-gradient:hover {
          transform: scale(1.02);
          filter: brightness(1.1);
        }

        .form-control-premium-lg {
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          color: #1e293b;
          font-weight: 600;
          font-size: 0.95rem;
          width: 100%;
          transition: all 0.2s ease;
        }

        .form-control-premium-lg:focus {
          background: #fff;
          border-color: #ff4b2b;
          box-shadow: 0 0 0 4px rgba(255, 75, 43, 0.1);
          outline: none;
        }

        .icon-badge {
          width: 64px;
          height: 64px;
          border-radius: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
        }

        .custom-switch .form-check-input {
          width: 3.2em;
          height: 1.6em;
          background-color: #e2e8f0;
          border-color: transparent;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .custom-switch .form-check-input:checked {
          background-color: #10b981;
        }

        .btn-close-custom {
          background: #f1f5f9;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          transition: all 0.2s ease;
        }

        .btn-close-custom:hover {
          background: #fff1f2;
          color: #ef4444;
          transform: rotate(90deg);
        }

        .setting-item {
          transition: all 0.2s ease;
          border-radius: 12px;
          margin: 0 -8px;
          padding: 12px 8px !important;
        }

        .setting-item:hover {
          background: #f8fafc;
        }

        .transition-all {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}
