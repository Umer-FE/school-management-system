"use client";
import { useState, useEffect, useCallback } from "react";
import DataTable from "@/components/Atoms/DataTable";
import { showSuccess, showError, showConfirm } from "@/lib/swal";

export default function PayrollManagement() {
  const [payroll, setPayroll] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [loading, setLoading] = useState(false);

  const fetchPayroll = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/payroll?month=${selectedMonth}`);

      if (!res.ok) {
        console.error("Server returned an error:", res.status);
        setPayroll([]);
        return;
      }

      const result = await res.json();

      if (result.success && Array.isArray(result.data)) {
        const sanitizedData = result.data.map((item) => ({
          ...item,
          manualFine: item.manualFine ?? 0,
          allowances: item.allowances ?? 0,
          attendanceDeduction: item.attendanceDeduction ?? 0,
          baseSalary: item.baseSalary ?? 0,
          netSalary: item.netSalary ?? 0,
          isAlreadyPaid: item.isAlreadyPaid ?? false,
        }));
        setPayroll(sanitizedData);
      } else {
        setPayroll([]);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setPayroll([]);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchPayroll();
  }, [fetchPayroll]);

  const handleAdjustment = (index, field, value) => {
    const updated = [...payroll];

    if (updated[index].isAlreadyPaid) return;

    const val = value === "" ? 0 : Number(value);
    updated[index][field] = val;

    const p = updated[index];
    const base = p.baseSalary || 0;
    const deduct = p.attendanceDeduction || 0;
    const fine = p.manualFine || 0;
    const bonus = p.allowances || 0;

    p.netSalary = base - deduct - fine + bonus;

    setPayroll(updated);
  };

  const handlePay = async (p) => {
    try {
      const res = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...p,
          teacherId: p.teacherId._id,
          status: "Paid",
          month: selectedMonth,
        }),
      });
      const result = await res.json();
      if (result.success) {
        showSuccess("Paid!", `Salary processed for ${p.teacherId.name} ✅`);
        fetchPayroll();
      } else {
        showError("Failed!", result.error || "Payment failed.");
      }
    } catch (error) {
      showError("Error!", "Payment failed. Check console for details.");
    }
  };

  const handleBulkPay = async () => {
    const unpaid = payroll.filter((p) => !p.isAlreadyPaid);
    if (unpaid.length === 0)
      return showError("All Paid!", "All staff members are already paid for this month.");

    const confirmResult = await showConfirm(
      "Process Salaries?",
      `Are you sure you want to process salaries for ${unpaid.length} staff members?`,
      "Yes, process all!"
    );

    if (!confirmResult.isConfirmed) return;

    try {
      const res = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          unpaid.map((p) => ({
            ...p,
            teacherId: p.teacherId._id,
            month: selectedMonth,
            status: "Paid",
          })),
        ),
      });

      if (res.ok) {
        showSuccess("Success!", "Bulk payment processed successfully! 💸");
        fetchPayroll();
      } else {
        showError("Failed!", "Bulk payment failed.");
      }
    } catch (error) {
      showError("Error!", "Bulk payment failed.");
    }
  };

  return (
    <div className="container-fluid py-4">
      <div
        className="card border-0 shadow-sm p-4 mb-4 bg-white"
        style={{ borderRadius: "15px" }}
      >
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <h3 className="fw-bold m-0 text-dark text-uppercase letter-spacing-1">
              <i className="bi bi-wallet2 me-2 text-primary"></i> Payroll
              Management
            </h3>
            <p className="text-muted small m-0 pt-1">
              Monthly Salary Processing & Disbursement
            </p>
          </div>
          <div className="d-flex gap-2">
            <input
              type="month"
              className="form-control border-0 bg-light shadow-sm fw-bold"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
            <button
              className="btn btn-primary shadow-sm px-4 fw-bold rounded-3"
              onClick={handleBulkPay}
              disabled={loading || !payroll.some((p) => !p.isAlreadyPaid)}
            >
              Bulk Pay All
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-grow text-primary" role="status"></div>
          <p className="mt-2 fw-semibold text-muted">Calculating Salaries...</p>
        </div>
      ) : (
        <DataTable
          headers={[
            "Teacher Name",
            "Base Pay",
            "Attendance Ded.",
            "Fine / Bonus",
            "Net Salary",
            "Status",
            "Action",
          ]}
          data={payroll}
          renderRow={(p, index) => (
            <tr
              key={p.teacherId?._id || index}
              className={p.isAlreadyPaid ? "bg-light opacity-75" : ""}
            >
              <td className="fw-bold px-4">{p.teacherId?.name || "N/A"}</td>
              <td>Rs. {(p.baseSalary || 0).toLocaleString()}</td>
              <td className="text-danger small">
                <span className="badge bg-danger-subtle text-danger mb-1">
                  {p.absents || 0} Absents
                </span>{" "}
                <br />
                <span className="fw-bold text-dark">
                  -Rs. {(p.attendanceDeduction || 0).toLocaleString()}
                </span>
              </td>
              <td>
                <div className="d-flex gap-2">
                  <input
                    type="number"
                    placeholder="Fine"
                    disabled={p.isAlreadyPaid}
                    className="form-control form-control-sm border-0 bg-light shadow-none"
                    style={{ width: "85px" }}
                    value={p.manualFine ?? 0}
                    onChange={(e) =>
                      handleAdjustment(index, "manualFine", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    placeholder="Bonus"
                    disabled={p.isAlreadyPaid}
                    className="form-control form-control-sm border-0 bg-light shadow-none"
                    style={{ width: "85px" }}
                    value={p.allowances ?? 0}
                    onChange={(e) =>
                      handleAdjustment(index, "allowances", e.target.value)
                    }
                  />
                </div>
              </td>
              <td
                className={`fw-bold fs-5 ${p.isAlreadyPaid ? "text-success" : "text-primary"}`}
              >
                Rs. {(p.netSalary || 0).toLocaleString()}
              </td>
              <td>
                <span
                  className={`badge rounded-pill px-3 py-2 ${p.isAlreadyPaid ? "bg-success text-white" : "bg-warning text-dark"}`}
                >
                  {p.isAlreadyPaid ? "PAID" : "PENDING"}
                </span>
              </td>
              <td>
                {p.isAlreadyPaid ? (
                  <button className="btn btn-sm btn-outline-secondary px-3 disabled border-0">
                    <i className="bi bi-check-circle-fill text-success"></i>{" "}
                    Recorded
                  </button>
                ) : (
                  <button
                    className="btn btn-sm btn-success px-3 fw-bold rounded-pill shadow-sm"
                    onClick={() => handlePay(p)}
                  >
                    Confirm & Pay
                  </button>
                )}
              </td>
            </tr>
          )}
        />
      )}
    </div>
  );
}
