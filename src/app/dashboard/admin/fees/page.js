"use client";
import { useState, useEffect } from "react";
import { showSuccess, showError, showConfirm } from "@/lib/swal";

export default function FeeManagement() {
  const [students, setStudents] = useState([]);
  const [feeRecords, setFeeRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingFeeId, setEditingFeeId] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]); // For bulk selection

  const [selectedMonth, setSelectedMonth] = useState("March 2024");
  const months = ["January 2024", "February 2024", "March 2024", "April 2024", "May 2024", "June 2024"];

  const [formData, setFormData] = useState({
    month: "March 2024",
    amount: 2500,
    status: "Paid",
  });

  const [historyPage, setHistoryPage] = useState(1);
  const historyPageSize = 10;
  const [searchTerm, setSearchTerm] = useState("");

  const currentMonthRecords = feeRecords.filter((f) => f.month === selectedMonth);
  const totalCollected = currentMonthRecords.reduce((sum, record) => sum + record.amount, 0);
  const studentsPaidThisMonth = new Set(currentMonthRecords.map((f) => f.studentId?._id)).size;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stdRes, feeRes] = await Promise.all([
        fetch("/api/students"),
        fetch("/api/fees"),
      ]);
      const stdData = await stdRes.json();
      const feeData = await feeRes.json();

      if (stdData.success) setStudents(stdData.data);
      if (feeData.success) setFeeRecords(feeData.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      showError("Error", "Failed to load fee data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setHistoryPage(1);
  }, [feeRecords]);

  const toggleStudentSelection = (id) => {
    setSelectedStudents(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const unpaidIds = students
        .filter(s => !feeRecords.some(f => f.studentId?._id === s._id && f.month === selectedMonth))
        .map(s => s._id);
      setSelectedStudents(unpaidIds);
    } else {
      setSelectedStudents([]);
    }
  };

  const handleOpenModal = (student) => {
    setSelectedStudent(student);
    setEditingFeeId(null);
    setFormData({ month: selectedMonth, amount: 2500, status: "Paid" });
    setShowModal(true);
  };

  const handleOpenEditModal = (fee) => {
    setSelectedStudent(fee.studentId);
    setEditingFeeId(fee._id);
    setFormData({
      month: fee.month,
      amount: fee.amount,
      status: fee.status || "Paid",
    });
    setShowModal(true);
  };

  const handleSubmitFee = async (e) => {
    e.preventDefault();
    try {
      const url = editingFeeId ? `/api/fees/${editingFeeId}` : "/api/fees";
      const method = editingFeeId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent._id,
          ...formData,
        }),
      });

      if (res.ok) {
        showSuccess(
          "Success",
          editingFeeId ? "Fee record updated!" : "Fee recorded successfully!"
        );
        setShowModal(false);
        setEditingFeeId(null);
        fetchData();
      }
    } catch (error) {
      showError("Error", "Failed to process fee payment");
    }
  };

  const handleBulkCollect = async () => {
    if (selectedStudents.length === 0) return;

    const confirm = await showConfirm(
      "Bulk Collect Fees",
      `Are you sure you want to collect fees for ${selectedStudents.length} students for ${selectedMonth}?`
    );

    if (confirm.isConfirmed) {
      try {
        setLoading(true);
        // We can process these sequentially or update API to handle bulk
        // Since API POST /api/fees currently takes single object, we'll hit it in a loop for now
        // A better way is to update API, but let's do this first for immediate result
        const promises = selectedStudents.map(id =>
          fetch("/api/fees", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              studentId: id,
              month: selectedMonth,
              amount: 2500,
              status: "Paid"
            })
          })
        );

        await Promise.all(promises);
        showSuccess("Success", `Fees collected for ${selectedStudents.length} students!`);
        setSelectedStudents([]);
        fetchData();
      } catch (err) {
        showError("Error", "Failed to collect multiple fees");
      } finally {
        setLoading(false);
      }
    }
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredStudents = students.filter((s) => {
    if (!normalizedSearch) return true;
    const name = s.name?.toLowerCase() || "";
    const cls = s.class?.toLowerCase() || "";
    return name.includes(normalizedSearch) || cls.includes(normalizedSearch);
  });

  const filteredFees = feeRecords.filter((f) => {
    if (!normalizedSearch) return true;
    const studentName = f.studentId?.name?.toLowerCase() || "";
    const month = f.month?.toLowerCase() || "";
    return studentName.includes(normalizedSearch) || month.includes(normalizedSearch);
  });

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold m-0">Fee Management</h2>
          <p className="text-muted small mb-0">Track and collect student monthly fees</p>
        </div>

        <div className="d-flex flex-column flex-md-row gap-2">
          <div className="d-flex align-items-center bg-white p-2 rounded-pill shadow-sm px-3 border">
            <span className="small fw-bold text-muted me-2 text-uppercase" style={{ fontSize: '11px' }}>
              Select Month:
            </span>
            <select
              className="form-select border-0 fw-bold text-primary p-0"
              style={{ width: "auto", cursor: "pointer", fontSize: '14px', background: 'transparent' }}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {months.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>

          <div className="input-group shadow-sm rounded-pill border" style={{ maxWidth: '300px' }}>
            <span className="input-group-text border-0 bg-white rounded-pill">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control border-0 rounded-pill"
              placeholder="Search student or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {[
          { label: `Total ${selectedMonth}`, value: `PKR ${totalCollected.toLocaleString()}`, color: 'primary', icon: 'bi-wallet2' },
          { label: "Paid Students", value: `${studentsPaidThisMonth} / ${students.length}`, color: 'success', icon: 'bi-check-circle' },
          { label: "Pending Collection", value: students.length - studentsPaidThisMonth, color: 'warning', icon: 'bi-clock-history' }
        ].map((stat, i) => (
          <div className="col-md-4" key={i}>
            <div className={`card border-0 shadow-sm bg-${stat.color} text-${stat.color === 'warning' ? 'dark' : 'white'} p-3`} style={{ borderRadius: "15px" }}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="small mb-1 opacity-75 fw-bold">{stat.label}</p>
                  <h3 className="fw-bold mb-0">{stat.value}</h3>
                </div>
                <i className={`bi ${stat.icon} display-6 opacity-25`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card border-0 shadow-sm mb-5" style={{ borderRadius: "15px" }}>
        <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold m-0 text-muted">Student Status - {selectedMonth}</h5>
          {selectedStudents.length > 0 && (
            <button
              className="btn btn-primary btn-sm rounded-pill px-4 shadow-sm animate__animated animate__pulse animate__infinite"
              onClick={handleBulkCollect}
            >
              Bulk Collect ({selectedStudents.length})
            </button>
          )}
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3" style={{ width: '50px' }}>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      onChange={handleSelectAll}
                      checked={selectedStudents.length > 0 && selectedStudents.length === students.filter(s => !feeRecords.some(f => f.studentId?._id === s._id && f.month === selectedMonth)).length}
                    />
                  </th>
                  <th className="py-3">Student Name</th>
                  <th className="py-3">Class</th>
                  <th className="py-3">Status</th>
                  <th className="text-end px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                    Loading records...
                  </td></tr>
                ) : filteredStudents.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-5 text-muted">No students matching search criteria</td></tr>
                ) : (
                  filteredStudents.map((s) => {
                    const isPaid = feeRecords.some((f) => f.studentId?._id === s._id && f.month === selectedMonth);
                    return (
                      <tr key={s._id} className={selectedStudents.includes(s._id) ? "table-primary" : ""}>
                        <td className="px-4">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            disabled={isPaid}
                            checked={selectedStudents.includes(s._id)}
                            onChange={() => toggleStudentSelection(s._id)}
                          />
                        </td>
                        <td className="fw-bold">{s.name}</td>
                        <td><span className="badge bg-light text-dark border">{s.class}</span></td>
                        <td>
                          {isPaid ? (
                            <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill">Paid <i className="bi bi-check-lg ms-1"></i></span>
                          ) : (
                            <span className="badge bg-danger-subtle text-danger px-3 py-2 rounded-pill">Unpaid <i className="bi bi-exclamation-circle ms-1"></i></span>
                          )}
                        </td>
                        <td className="text-end px-4">
                          {!isPaid && (
                            <button className="btn btn-sm btn-primary rounded-pill px-3 shadow-xs" onClick={() => handleOpenModal(s)}>
                              Collect Fee
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <h4 className="fw-bold mb-3 text-muted">All Transactions History</h4>
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "15px" }}>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="bg-light text-muted small">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th>Month</th>
                <th>Amount</th>
                <th>Date</th>
                <th className="text-end px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFees.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-4 text-muted">No transactions found</td></tr>
              ) : (
                filteredFees
                  .slice().reverse()
                  .slice((historyPage - 1) * historyPageSize, historyPage * historyPageSize)
                  .map((f) => (
                    <tr key={f._id}>
                      <td className="px-4 fw-bold text-dark">{f.studentId?.name || "N/A"}</td>
                      <td><span className="badge bg-light text-dark">{f.month}</span></td>
                      <td className="text-success fw-bold">Rs. {f.amount}</td>
                      <td className="text-muted small">{new Date(f.createdAt).toLocaleDateString()}</td>
                      <td className="text-end px-4">
                        <button type="button" className="btn btn-sm btn-light border me-2" onClick={() => handleOpenEditModal(f)}>
                          <i className="bi bi-pencil text-primary"></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-light border"
                          onClick={async () => {
                            const confirm = await showConfirm("Delete?", "Are you sure you want to delete this fee record?");
                            if (!confirm.isConfirmed) return;
                            try {
                              const res = await fetch(`/api/fees/${f._id}`, { method: "DELETE" });
                              if (res.ok) {
                                showSuccess("Deleted", "Fee record removed");
                                fetchData();
                              }
                            } catch {
                              showError("Error", "Failed to delete record");
                            }
                          }}
                        >
                          <i className="bi bi-trash text-danger"></i>
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
        {filteredFees.length > historyPageSize && (
          <div className="d-flex justify-content-between align-items-center px-4 py-3 border-top bg-white">
            <small className="text-muted">Showing {(historyPage - 1) * historyPageSize + 1}–{Math.min(historyPage * historyPageSize, filteredFees.length)} of {filteredFees.length}</small>
            <nav><ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${historyPage === 1 ? "disabled" : ""}`}><button className="page-link" onClick={() => setHistoryPage(p => p - 1)}>Prev</button></li>
              <li className={`page-item ${historyPage * historyPageSize >= filteredFees.length ? "disabled" : ""}`}><button className="page-link" onClick={() => setHistoryPage(p => p + 1)}>Next</button></li>
            </ul></nav>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "20px" }}>
              <div className="modal-header border-0 pt-4 px-4 bg-primary text-white rounded-top-20">
                <h5 className="modal-title fw-bold">
                  {editingFeeId ? `Edit: ${selectedStudent?.name}` : `Pay: ${selectedStudent?.name}`}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmitFee}>
                <div className="modal-body p-4">
                  <div className="bg-light p-3 rounded-3 mb-4">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted small fw-bold">Student Name:</span>
                      <span className="fw-bold">{selectedStudent?.name}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted small fw-bold">Class:</span>
                      <span className="badge bg-secondary">{selectedStudent?.class}</span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">Month</label>
                    <select
                      className="form-select border-0 bg-light fw-bold"
                      value={formData.month}
                      onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    >
                      {months.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">Amount (PKR)</label>
                    <input
                      type="number"
                      className="form-control border-0 bg-light p-2 fw-bold text-primary"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="modal-footer border-0 pb-4">
                  <button type="submit" className="btn btn-primary w-100 py-2 fw-bold shadow-sm rounded-pill">
                    {editingFeeId ? "Update Transaction" : "Confirm & Pay Fees"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        .rounded-top-20 { border-top-left-radius: 20px; border-top-right-radius: 20px; }
        .shadow-xs { box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
      `}</style>
    </div>
  );
}
