import React from "react";
import {
  IoChevronBackOutline,
  IoChevronForwardOutline,
} from "react-icons/io5";

export default function AdminPagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 5,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
}) {
  if (totalItems === 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startEntry = (safeCurrentPage - 1) * pageSize + 1;
  const endEntry = Math.min(safeCurrentPage * pageSize, totalItems);

  // Helper to generate smart page numbers
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    if (safeCurrentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (safeCurrentPage >= totalPages - 3) {
      pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, "...", totalPages);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="adm-pagination-bar">
      <div className="adm-pagination-left">
        <span className="adm-pagination-info">
          Showing <strong>{startEntry}</strong> to <strong>{endEntry}</strong> of{" "}
          <strong>{totalItems}</strong> entries
        </span>

        {onPageSizeChange && (
          <div className="adm-pagination-per-page">
            <span>Show</span>
            <select
              className="adm-pagination-select"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
           
          </div>
        )}
      </div>

      <div className="adm-pagination-controls">
        <button
          type="button"
          className="adm-pagination-btn adm-pagination-btn--nav"
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage <= 1}
          title="Previous Page"
        >
          <IoChevronBackOutline size={15} />
          <span>Previous</span>
        </button>

        <div className="adm-pagination-pages">
          {pages.map((p, idx) => {
            if (p === "...") {
              return (
                <span key={`ellipsis-${idx}`} className="adm-pagination-ellipsis">
                  •••
                </span>
              );
            }

            const isActive = p === safeCurrentPage;
            return (
              <button
                key={p}
                type="button"
                className={`adm-pagination-btn adm-pagination-btn--num ${
                  isActive ? "adm-pagination-btn--active" : ""
                }`}
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="adm-pagination-btn adm-pagination-btn--nav"
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage >= totalPages}
          title="Next Page"
        >
          <span>Next</span>
          <IoChevronForwardOutline size={15} />
        </button>
      </div>
    </div>
  );
}
