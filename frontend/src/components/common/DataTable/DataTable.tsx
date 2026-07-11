import React from "react";
import styles from "./DataTable.module.css";

interface DataTableProps {
  columns: string[];
  loading?: boolean;
  loadingMessage?: string;
  isEmpty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
}

export default function DataTable({
  columns,
  loading = false,
  loadingMessage = "Loading...",
  isEmpty = false,
  emptyMessage = "No data found.",
  children,
}: DataTableProps) {
  return (
    <div className={styles.tableContainer}>
      {loading ? (
        <div className={styles.emptyState}>{loadingMessage}</div>
      ) : isEmpty ? (
        <div className={styles.emptyState}>{emptyMessage}</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={index}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      )}
    </div>
  );
}
