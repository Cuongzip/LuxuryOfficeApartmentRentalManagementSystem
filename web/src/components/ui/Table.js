import React from 'react';

export const Table = ({
  columns = [], // Array of { header: string, key: string, render: (row) => ReactNode }
  data = [],
  isLoading = false,
  emptyMessage = 'Không có dữ liệu hiển thị.',
  className = '',
  onRowClick,
}) => {
  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 ${className}`}>
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-400 select-none"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-12 text-center text-slate-500">
                <div className="flex flex-col items-center justify-center gap-3">
                  <svg className="animate-spin h-6 w-6 text-blue-950 dark:text-blue-200" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Đang tải dữ liệu...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-12 text-center text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
              >
                {columns.map((col, colIdx) => (
                  <td key={col.key || colIdx} className="px-5 py-4 text-slate-800 dark:text-slate-200">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
