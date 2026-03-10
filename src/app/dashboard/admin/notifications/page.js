"use client";
import { useState, useEffect } from "react";
import DataTable from "@/components/Atoms/DataTable";
import CustomModal from "@/components/Atoms/CustomModal";
import FormInput from "@/components/Molecules/FormInput";

export default function ManageNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        message: "",
        audience: "All",
        sender: "Admin",
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/notifications");
            const data = await res.json();
            if (data.success) setNotifications(data.data);
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch("/api/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await res.json();

            if (res.ok && result.success) {
                alert("Notification Sent! 🎉");
                closeModal();
                fetchData();
            } else {
                alert(result.error || "Operation failed");
            }
        } catch (error) {
            alert("Error processing request");
        } finally {
            setSubmitting(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setFormData({ title: "", message: "", audience: "All", sender: "Admin" });
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-0">Notifications</h2>
                    <p className="text-muted small">Broadcast messages and announcements</p>
                </div>
                <button className="btn btn-primary shadow-sm px-4" onClick={() => setShowModal(true)}>
                    <i className="bi bi-bell-fill me-2"></i> Send Notification
                </button>
            </div>

            <DataTable
                headers={["Date", "Title", "Message", "Audience", "Sender"]}
                data={notifications}
                renderRow={(notice) => (
                    <tr key={notice._id}>
                        <td className="px-4 text-muted small">{new Date(notice.createdAt).toLocaleString()}</td>
                        <td className="fw-bold text-primary">{notice.title}</td>
                        <td>{notice.message.length > 50 ? notice.message.substring(0, 50) + "..." : notice.message}</td>
                        <td>
                            <span className={`badge rounded-pill ${notice.audience === 'All' ? 'bg-primary' :
                                    notice.audience === 'Teachers' ? 'bg-info text-dark' : 'bg-success'
                                }`}>
                                {notice.audience}
                            </span>
                        </td>
                        <td>{notice.sender}</td>
                    </tr>
                )}
            />

            <CustomModal show={showModal} title="Send Notification" onClose={closeModal}>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <FormInput
                            label="Notification Title"
                            value={formData.title}
                            required
                            placeholder="e.g. Holiday Announcement"
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>
                    <div className="mb-3">
                        <FormInput
                            label="Message content"
                            type="textarea"
                            value={formData.message}
                            required
                            placeholder="Type your message here..."
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="form-label small fw-bold text-muted">Audience</label>
                        <select
                            className="form-select border-0 bg-light"
                            value={formData.audience}
                            onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                        >
                            <option value="All">All Users</option>
                            <option value="Teachers">Teachers Only</option>
                            <option value="Students">Students Only</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary w-100 fw-bold py-2" disabled={submitting}>
                        {submitting ? "Sending..." : "🚀 Broadcast Message"}
                    </button>
                </form>
            </CustomModal>
        </div>
    );
}
