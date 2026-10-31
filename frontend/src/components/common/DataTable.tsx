import React, { useState, ReactNode } from 'react';
import { Search, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import Badge from './Badge';

type CellRenderer = (value: unknown, row: Record<string, unknown>) => ReactNode;

interface Column {
  key: string;
  label: string;
  render?: CellRenderer;
  muted?: boolean;
  amount?: boolean;
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, unknown>[];
  onRowClick?: (row: Record<string, unknown>) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  toolbar?: ReactNode;
  emptyMessage?: string;
  pageSize?: number;
}

export default function DataTable({
  columns,
  data,
  onRowClick,
  searchable = true,
  searchPlaceholder = 'Search...',
  toolbar,
  emptyMessage = 'No records found.',
  pageSize = 10,
}: DataTableProps) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const filtered = query
    ? data.filter((row) =>
        Object.values(row).some((v) =>
          String(v).toLowerCase().includes(query.toLowerCase())
        )
      )
    : data;

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSearch = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  return (
    <div className="card">
      {(searchable || toolbar) && (
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            {searchable && (
              <div className="search-input-wrap">
                <Search size={15} />
                <input
                  className="search-input"
                  placeholder={searchPlaceholder}
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            )}
          </div>
          <div className="table-toolbar-right">{toolbar}</div>
        </div>
      )}
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
              {onRowClick && <th className="col-actions"></th>}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (onRowClick ? 1 : 0)} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paged.map((row, i) => (
                <tr
                  key={i}
                  onClick={() => onRowClick?.(row)}
                  style={onRowClick ? { cursor: 'pointer' } : {}}
                >
                  {columns.map((col) => {
                    const value = row[col.key];
                    return (
                      <td
                        key={col.key}
                        className={[
                          col.muted ? 'col-muted' : '',
                          col.amount ? 'col-amount' : '',
                        ].join(' ')}
                      >
                        {col.render ? (
                          col.render(value, row)
                        ) : col.key === 'status' || col.key === 'Status' ? (
                          <Badge status={String(value)} />
                        ) : (
                          <span>{value !== undefined && value !== null ? String(value) : '—'}</span>
                        )}
                      </td>
                    );
                  })}
                  {onRowClick && (
                    <td className="col-actions">
                      <button className="table-row-btn" onClick={(e) => { e.stopPropagation(); onRowClick(row); }}>
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <span className="table-footer-info">
          Showing {Math.min((page - 1) * pageSize + 1, filtered.length)}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
        </span>
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`pagination-btn ${p === page ? 'active' : ''}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            className="pagination-btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

