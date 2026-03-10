"use client";
import { useState, useEffect } from "react";
import DataTable from "@/components/Atoms/DataTable";

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const resAssignments = await fetch("/api/assignments");
      const dataAssignments = await resAssignments.json();

      if (dataAssignments.success) setAssignments(dataAssignments.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleViewDetails = (assign) => {
    setSelectedAssignment(assign);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAssignment(null);
  };

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-0">My Assignments</h2>
        <p className="text-muted small">
          View all your pending and past assignments
        </p>
      </div>

      <DataTable
        headers={[
          "Title",
          "Subject",
          "Teacher",
          "Due Date",
          "Total Marks",
          "Status",
        ]}
        data={assignments}
        renderRow={(assign) => (
          <tr key={assign._id}>
            <td className="px-4 fw-bold text-primary">
              {assign.title}
              <br />
              <small className="text-muted fw-normal">
                {assign.description?.substring(0, 50)}...
              </small>
            </td>
            <td>{assign.subjectRef ? assign.subjectRef.name : "N/A"}</td>
            <td>{assign.teacherRef ? assign.teacherRef.name : "N/A"}</td>
            <td>
              <span
                className={`badge ${new Date(assign.dueDate) < new Date() ? "bg-danger-subtle text-danger" : "bg-success-subtle text-success"}`}
              >
                {new Date(assign.dueDate).toLocaleDateString()}
              </span>
            </td>
            <td className="fw-bold">{assign.totalMarks}</td>
            <td className="text-end px-4">
              <button
                onClick={() => handleViewDetails(assign)}
                className="btn btn-sm btn-outline-primary shadow-sm rounded-pill px-3"
              >
                View Details
              </button>
            </td>
          </tr>
        )}
      />

      {/* Assignment Detail Modal */}
      {showModal && selectedAssignment && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div
              className="modal-content border-0 shadow-lg"
              style={{ borderRadius: "20px" }}
            >
              <div className="modal-header border-0 pt-4 px-4 align-items-center">
                <h4 className="modal-title fw-bold text-primary">
                  <i className="bi bi-journal-text me-2"></i>
                  {selectedAssignment.title}
                </h4>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-4 mb-4">
                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded-3 h-100">
                      <p className="text-muted small mb-1">Subject</p>
                      <p className="fw-bold mb-0">
                        {selectedAssignment.subjectRef?.name || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded-3 h-100">
                      <p className="text-muted small mb-1">Teacher</p>
                      <p className="fw-bold mb-0">
                        {selectedAssignment.teacherRef?.name || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded-3 h-100">
                      <p className="text-muted small mb-1">Due Date</p>
                      <p
                        className={`fw-bold mb-0 ${new Date(selectedAssignment.dueDate) < new Date() ? "text-danger" : "text-success"}`}
                      >
                        {new Date(
                          selectedAssignment.dueDate,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h6 className="fw-bold text-dark mb-3">Description</h6>
                  <div
                    className="p-3 border rounded-3 bg-white"
                    style={{ minHeight: "100px", whiteSpace: "pre-wrap" }}
                  >
                    {selectedAssignment.description}
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center bg-primary-subtle p-3 rounded-3">
                  <div>
                    <span className="text-muted small">Total Marks:</span>
                    <span className="fw-bold ms-2 text-primary">
                      {selectedAssignment.totalMarks}
                    </span>
                  </div>
                  <button className="btn btn-primary px-4 rounded-pill shadow-sm">
                    Submit Work
                  </button>
                </div>
              </div>
              <div className="modal-footer border-0 pb-4">
                <button
                  type="button"
                  className="btn btn-light rounded-pill px-4"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
