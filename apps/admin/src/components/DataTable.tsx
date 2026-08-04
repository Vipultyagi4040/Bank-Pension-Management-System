import { useState, useRef, useEffect, useMemo } from "react";
import {
  Search, Download, FileText, Filter, Eye, EyeOff,
  ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, FileDown, FileText as PdfIcon
} from "lucide-react";
import FormField from "./FormField";

export type ColumnDef<T> = {
  key: string;
  label: string;
  accessor?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: number | string;
  hideable?: boolean;
  defaultVisible?: boolean;
  className?: string;
  headerClassName?: string;
  exportable?: boolean;
};

export type FilterOption = {
  key: string;
  label: string;
  options: { value: string; label: string }[];
};

export type DataTableProps<T> = {
  data: T[];
  columns: ColumnDef<T>[];
  searchFields?: string[];
  searchPlaceholder?: string;
  searchTerm?: string;
  onSearch?: (term: string) => void;
  filters?: FilterOption[];
  filterValues?: Record<string, string>;
  setFilterValue?: (key: string, value: string) => void;
  sortKey?: string;
  sortDir?: "asc" | "desc";
  setSort?: (key: string, dir: "asc" | "desc") => void;
  enableSorting?: boolean;
  enableSearch?: boolean;
  enableExport?: boolean;
  exportFilename?: string;
  paginated?: boolean;
  page?: number;
  limit?: number;
  total?: number;
  setPage?: (page: number) => void;
  pageSizeOptions?: number[];
  setLimit?: (limit: number) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  rowKey?: (row: T, index: number) => string;
  onRowClick?: (row: T) => void;
  badgeRenderer?: (row: T) => React.ReactNode;
  actions?: (row: T) => React.ReactNode;
  actionsWidth?: number | string;
  tableStyle?: React.CSSProperties;
  className?: string;
};

function classNames(...args: (string | false | undefined)[]) {
  return args.filter(Boolean).join(" ");
}

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchFields = [],
  searchPlaceholder = "Search...",
  searchTerm,
  onSearch,
  filters = [],
  filterValues = {},
  setFilterValue,
  sortKey,
  sortDir,
  setSort,
  enableSorting = true,
  enableSearch = true,
  enableExport = true,
  exportFilename = "export",
  paginated = true,
  page = 1,
  limit = 20,
  total = 0,
  setPage,
  pageSizeOptions = [10, 20, 50, 100],
  setLimit,
  isLoading = false,
  emptyMessage = "No data found",
  emptyIcon,
  rowKey,
  onRowClick,
  badgeRenderer,
  actions,
  actionsWidth = 120,
  tableStyle,
  className
}: DataTableProps<T>) {
  const [internalSearch, setInternalSearch] = useState("");
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    () => columns.reduce((acc, col) => {
      acc[col.key] = col.defaultVisible !== false;
      return acc;
    }, {} as Record<string, boolean>)
  );
  const [colWidths, setColWidths] = useState<Record<string, number>>({});
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const resizeRef = useRef<{ key: string; startX: number; startWidth: number } | null>(null);

  const effectiveSearchTerm = onSearch !== undefined ? (searchTerm || "") : internalSearch;
  const onSearchChange = onSearch !== undefined ? onSearch : setInternalSearch;

  const filteredData = useMemo(() => {
    let result = data || [];

    if (effectiveSearchTerm && onSearch === undefined && searchFields.length > 0) {
      result = result.filter((row) =>
        searchFields.some((field) => {
          const val = row[field];
          if (val == null) return false;
          return String(val).toLowerCase().includes(effectiveSearchTerm.toLowerCase());
        })
      );
    }

    return result;
  }, [data, effectiveSearchTerm, searchFields, onSearch]);

  const totalPages = paginated && total > 0 ? Math.max(1, Math.ceil(total / limit)) : 1;

  const exportColumns = columns.filter((c) => c.exportable !== false).filter((c) => visibleColumns[c.key]);

  const exportToCSV = () => {
    const csvRows: string[] = [];
    const headers = exportColumns.map((c) => c.label).join(",");
    csvRows.push(headers);

    (filteredData || []).forEach((row) => {
      const values = exportColumns.map((col) => {
        let val: any = col.accessor ? col.accessor(row) : row[col.key];
        if (val === null || val === undefined) val = "";
        if (typeof val === "object") val = JSON.stringify(val);
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(","));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportFilename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const { jsPDF } = window as any;
    if (!jsPDF) {
      alert("PDF export requires the jsPDF library. CSV export is available.");
      return;
    }
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(exportFilename, 14, 20);
    doc.setFontSize(10);

    const headers = exportColumns.map((c) => c.label);
    const rows = (filteredData || []).map((row) =>
      exportColumns.map((col) => {
        const val = col.accessor ? col.accessor(row) : row[col.key];
        return val === null || val === undefined ? "" : String(val);
      })
    );

    (doc as any).autoTable({
      head: [headers],
      body: rows,
      startY: 30,
      theme: "grid",
      styles: { fontSize: 8, cellWidth: "wrap" },
      headStyles: { fillColor: [14, 165, 233] }
    });

    doc.save(`${exportFilename}.pdf`);
  };

  const visibleCols = columns.filter((c) => visibleColumns[c.key]);

  const handleMouseDown = (col: ColumnDef<T>, e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = colWidths[col.key] || (typeof col.width === "number" ? col.width : 150);
    resizeRef.current = { key: col.key, startX, startWidth };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!resizeRef.current) return;
    const diff = e.clientX - resizeRef.current.startX;
    const newWidth = Math.max(60, resizeRef.current.startWidth + diff);
    setColWidths((prev) => ({ ...prev, [resizeRef.current!.key]: newWidth }));
  };

  const handleMouseUp = () => {
    resizeRef.current = null;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSort = (col: ColumnDef<T>) => {
    if (!col.sortable && !enableSorting) return;
    if (sortKey === col.key && setSort) {
      setSort(col.key, sortDir === "asc" ? "desc" : "asc");
    } else if (setSort) {
      setSort(col.key, "desc");
    }
  };

  return (
    <div className="datatable" style={tableStyle}>
      {(enableSearch || filters.length > 0 || enableExport || showColumnMenu) && (
        <div className="datatable-toolbar">
          {enableSearch && (
            <div className="datatable-search">
              <Search size={18} />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={effectiveSearchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
          )}

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {filters.length > 0 && setFilterValue && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                style={{ position: "relative" }}
              >
                <Filter size={16} />
                Filters
              </button>
            )}

            {enableExport && (
              <button className="btn btn-secondary btn-sm" onClick={exportToCSV}>
                <FileDown size={16} />
                CSV
              </button>
            )}

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              title="Column settings"
            >
              <Eye size={16} />
              Columns
            </button>
          </div>
        </div>
      )}

      {showFilterMenu && filters.length > 0 && setFilterValue && (
        <div className="datatable-filter-panel">
          {filters.map((f) => (
            <FormField
              key={f.key}
              label={f.label}
              name={f.key}
              type="select"
              options={f.options.map((opt) => ({ value: opt.value, label: opt.label }))}
              value={filterValues[f.key] || ""}
              onChange={(e) => setFilterValue(f.key, e.target.value)}
              layout="vertical"
              fullWidth
              style={{ marginBottom: 12, minWidth: 140 }}
              inputClassName="form-select-sm"
            />
          ))}
          <button
            className="btn btn-primary btn-sm"
            style={{ marginTop: 8 }}
            onClick={() => setShowFilterMenu(false)}
          >
            Apply
          </button>
        </div>
      )}

      {showColumnMenu && (
        <div className="datatable-column-menu">
          <div className="column-menu-title">Visible Columns</div>
          {columns.filter((c) => c.hideable !== false).map((col) => (
            <label
              key={col.key}
              className="column-menu-item"
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", cursor: "pointer" }}
            >
              <input
                type="checkbox"
                checked={visibleColumns[col.key]}
                onChange={() => toggleColumn(col.key)}
              />
              <span style={{ fontSize: "0.85rem" }}>{col.label}</span>
            </label>
          ))}
        </div>
      )}

      <div className="table-container datatable-card">
        <div className="table-wrap datatable-wrap">
          <table className="datatable-table">
            <thead>
              <tr>
                {visibleCols.map((col) => (
                  <th
                    key={col.key}
                    className={classNames("datatable-th", col.headerClassName)}
                    style={{
                      width: colWidths[col.key] || col.width,
                      minWidth: colWidths[col.key] || col.width || 120,
                      userSelect: "none"
                    }}
                  >
                    <div
                      className="datatable-th-content"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        cursor: (col.sortable && enableSorting) || (setSort && enableSorting) ? "pointer" : "default"
                      }}
                      onClick={() => toggleSort(col)}
                    >
                      {col.label}
                      {col.sortable !== false && setSort && enableSorting && (
                        <span style={{ display: "flex", flexDirection: "column" }}>
                          {sortKey === col.key ? (
                            sortDir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                          ) : (
                            <ArrowUpDown size={12} style={{ opacity: 0.5 }} />
                          )}
                        </span>
                      )}
                    </div>
                    {col.sortable !== false && enableSorting && col.hideable !== false && (
                      <div
                        className="datatable-resizer"
                        onMouseDown={(e) => handleMouseDown(col, e)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </th>
                ))}
                {actions && (
                  <th
                    className="datatable-th datatable-th-actions"
                    style={{ width: actionsWidth, minWidth: actionsWidth }}
                  >
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={visibleCols.length + (actions ? 1 : 0)}>
                    <div className="skeleton-row">
                      {visibleCols.map((_, i) => (
                        <div key={i} className="skeleton skeleton-text" style={{ height: 16, marginBottom: 8 }} />
                      ))}
                    </div>
                  </td>
                </tr>
              )}
              {!isLoading && (!filteredData || filteredData.length === 0) && (
                <tr>
                  <td colSpan={visibleCols.length + (actions ? 1 : 0)}>
                    <div className="empty-state">
                      {emptyIcon || <FileText size={48} />}
                      <h3>{emptyMessage}</h3>
                    </div>
                  </td>
                </tr>
              )}
              {!isLoading && filteredData?.map((row, i) => {
                const rowKeyVal = rowKey ? rowKey(row, i) : String(i);
                return (
                  <tr
                    key={rowKeyVal}
                    className={classNames(
                      "datatable-row",
                      badgeRenderer ? "with-badge" : "",
                      onRowClick ? "clickable" : ""
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {visibleCols.map((col) => (
                      <td key={col.key} className={classNames("datatable-td", col.className)}>
                        {col.accessor ? col.accessor(row) : String(row[col.key] ?? "-")}
                      </td>
                    ))}
                    {actions && (
                      <td className="datatable-actions">
                        {actions(row)}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {paginated && (
        <div className="pagination">
          <div className="pagination-info">
            Page {page || 1} of {totalPages} ({total || 0} total)
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {setLimit && (
              <select
                className="form-select form-select-sm"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                style={{ width: 70, padding: "4px 8px", fontSize: "0.8rem" }}
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}
            <div className="pagination-buttons">
              <button
                className="pagination-btn"
                disabled={page <= 1}
                onClick={() => setPage && setPage((page || 1) - 1)}
              >
                Previous
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if ((page || 1) <= 3) {
                  pageNum = i + 1;
                } else if ((page || 1) >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = (page || 1) - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    className={`pagination-btn ${page === pageNum ? "active" : ""}`}
                    onClick={() => setPage && setPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                className="pagination-btn"
                disabled={page >= totalPages}
                onClick={() => setPage && setPage((page || 1) + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
