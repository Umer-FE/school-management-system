"use client";
import { useState, useEffect } from "react";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await fetch("/api/notifications");
                const data = await res.json();
                if (data.success) {
                    setNotifications(data.data);
                    // Mark all as read by saving current time
                    localStorage.setItem("notifLastSeen", new Date().toISOString());
                    // Dispatch event so layout bell updates immediately
                    window.dispatchEvent(new Event("notifRead"));
                }
            } catch (err) {
                console.error("Error fetching notifications:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    return (
        <div className="container-fluid py-4">
            <div className="mb-4">
                <h2 className="fw-bold text-dark mb-0">
                    <i className="bi bi-bell me-2 text-primary"></i>Notifications
                </h2>
                <p className="text-muted small">Your latest school announcements and alerts</p>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                </div>
            ) : notifications.length === 0 ? (
                <div className="text-center py-5">
                    <i className="bi bi-bell-slash fs-1 text-muted"></i>
                    <p className="text-muted mt-3">No notifications yet.</p>
                </div>
            ) : (
                <div className="d-flex flex-column gap-3">
                    {notifications.map((notif) => (
                        <div
                            key={notif._id}
                            className="card border-0 shadow-sm"
                            style={{ borderRadius: "12px" }}
                        >
                            <div className="card-body d-flex align-items-start gap-3 py-3 px-4">
                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary flex-shrink-0"
                                    style={{ width: 42, height: 42 }}
                                >
                                    <i className="bi bi-megaphone fs-5"></i>
                                </div>
                                <div className="flex-grow-1">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <h6 className="fw-bold mb-1">{notif.title}</h6>
                                        <small className="text-muted ms-2 text-nowrap">
                                            {new Date(notif.createdAt).toLocaleDateString()}
                                        </small>
                                    </div>
                                    <p className="text-muted small mb-0">{notif.message}</p>
                                    {notif.target && (
                                        <span className="badge bg-primary-subtle text-primary mt-1 small">
                                            {notif.target}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
