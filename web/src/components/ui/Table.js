import React from 'react';
import { Loading } from './Loading';

export const Table = ({
  columns = [],
  data = [],
  isLoading = false,
  emptyMessage = 'Không có dữ liệu hiển thị.',
  className = '',
  onRowClick,
}) => {
  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-neutral-200 bg-white ${className}`}>
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-neutral-100 bg-neutral-50">
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                className="px-5 py-4 font-semibold text-neutral-600 select-none"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-12 text-center text-neutral-500">
                <Loading text="Đang tải dữ liệu..." size="sm" />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-12 text-center text-neutral-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`hover:bg-neutral-50/50 transition-colors ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
              >
                {columns.map((col, colIdx) => (
                  <td key={col.key || colIdx} className="px-5 py-4 text-neutral-800">
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
