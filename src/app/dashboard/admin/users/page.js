"use client";

import { useEffect, useState } from "react";
import DataTable from "@/components/Atoms/DataTable";
import { showSuccess, showError, showConfirm } from "@/lib/swal";

const ROLE_OPTIONS = ["admin", "teacher", "student"];

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch (err) {
      console.error("User fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = (id, role) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === id ? { ...u, role } : u)),
    );
  };

  const handleSave = async (user) => {
    try {
      setSavingId(user._id);
      const res = await fetch(`/api/users/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: user.name, role: user.role }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showSuccess("Saved!", "User role updated successfully.");
      } else {
        showError("Failed!", data.error || "Update failed");
        fetchUsers();
      }
    } catch {
      showError("Error!", "Update failed. Please try again.");
      fetchUsers();
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id) => {
    const confirmResult = await showConfirm("Are you sure?", "Delete this user? This cannot be undone.");
    if (confirmResult.isConfirmed) {
      try {
        const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (res.ok && data.success) {
          showSuccess("Deleted!", "User has been removed.");
          setUsers((prev) => prev.filter((u) => u._id !== id));
        } else {
          showError("Failed!", data.error || "Delete failed");
        }
      } catch {
        showError("Error!", "Delete failed. Please try again.");
      }
    }
  };

  const normalized = search.trim().toLowerCase();
  const filtered = users.filter((u) => {
    if (!normalized) return true;
    return (
      u.name.toLowerCase().includes(normalized) ||
      u.email.toLowerCase().includes(normalized) ||
      u.role.toLowerCase().includes(normalized)
    );
  });

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold m-0">User Management</h2>
          <p className="text-muted small mb-0">
            Manage roles and access for all accounts
          </p>
        </div>
        <div className="input-group shadow-sm rounded-pill" style={{ maxWidth: 320 }}>
          <span className="input-group-text border-0 bg-white rounded-pill">
            <i className="bi bi-search text-muted" />
          </span>
          <input
            type="text"
            className="form-control border-0 rounded-pill"
            placeholder="Search by name, email or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">Loading users...</div>
      ) : (
        <DataTable
          headers={["Name", "Email", "Role", "Created", "Actions"]}
          data={filtered}
          pageSize={10}
          renderRow={(u) => (
            <tr key={u._id}>
              <td className="px-4 fw-semibold">{u.name}</td>
              <td>{u.email}</td>
              <td>
                <select
                  className="form-select form-select-sm w-auto"
                  value={u.role}
                  onChange={(e) => handleRoleChange(u._id, e.target.value)}
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
              </td>
              <td className="text-muted small">
                {u.createdAt
                  ? new Date(u.createdAt).toLocaleDateString()
                  : "-"}
              </td>
              <td className="text-end px-4">
                <button
                  type="button"
                  className="btn btn-sm btn-light border me-2"
                  disabled={savingId === u._id}
                  onClick={() => handleSave(u)}
                >
                  {savingId === u._id ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    <i className="bi bi-save text-primary" />
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-light border"
                  onClick={() => handleDelete(u._id)}
                >
                  <i className="bi bi-trash text-danger" />
                </button>
              </td>
            </tr>
          )}
        />
      )}
    </div>
  );
}

