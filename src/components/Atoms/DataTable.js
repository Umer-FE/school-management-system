"use client";

import { useEffect, useState } from "react";

export default function DataTable({
  headers,
  data,
  renderRow,
  pageSize = 10,
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    // Jab data change ho to first page se shuru karein
    setCurrentPage(1);
  }, [data, pageSize]);

  const startIndex = (currentPage - 1) * pageSize;
  const currentPageData = data.slice(startIndex, startIndex + pageSize);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Page number buttons (max 5 at a time)
  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);
  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  return (
    <div
      className="card border-0 shadow-sm overflow-hidden"
      style={{ borderRadius: "15px" }}
    >
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="bg-light">
            <tr>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className={`${i === 0 ? "px-4" : ""} ${i === headers.length - 1 ? "text-end px-4" : ""} py-3`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentPageData.length > 0 ? (
              currentPageData.map((item, index) =>
                renderRow(item, startIndex + index),
              )
            ) : (
              <tr>
                <td
                  colSpan={headers.length}
                  className="text-center py-5 text-muted"
                >
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalItems > pageSize && (
        <div className="d-flex justify-content-between align-items-center px-4 py-3 border-top bg-white">
          <small className="text-muted">
            Showing{" "}
            {`${totalItems === 0 ? 0 : startIndex + 1}–${Math.min(
              startIndex + currentPageData.length,
              totalItems,
            )} of ${totalItems}`}
          </small>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => goToPage(currentPage - 1)}
                >
                  Previous
                </button>
              </li>
              {Array.from(
                { length: endPage - startPage + 1 },
                (_, idx) => startPage + idx,
              ).map((page) => (
                <li
                  key={page}
                  className={`page-item ${
                    page === currentPage ? "active" : ""
                  }`}
                >
                  <button className="page-link" onClick={() => goToPage(page)}>
                    {page}
                  </button>
                </li>
              ))}
              <li
                className={`page-item ${
                  currentPage === totalPages ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => goToPage(currentPage + 1)}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
