"use client";
// src/components/worklist/WorklistTable.tsx
import React from "react";
import WorklistTableHeader from "./WorklistTableHeader";
import WorklistTableRow from "./WorklistTableRow";
import AddDataRow from "./AddDataRow";
import type { ColumnDefinition, Patient } from "@/types/worklist";

interface WorklistTableProps {
  columns: ColumnDefinition[];
  data: Patient[];
  onAddRow: (row: Patient) => void;
  onAddColumn: (column: ColumnDefinition) => void;
  onRowClick?: (row: Patient) => void;
}

export default function WorklistTable({
  columns,
  data,
  onAddRow,
  onAddColumn,
  onRowClick,
}: WorklistTableProps) {
  return (
    <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
      <table className="table w-full">
        <WorklistTableHeader columns={columns} onAddColumn={onAddColumn} />
        <tbody>
          {data.map((row) => (
            <WorklistTableRow
              key={row.id}
              row={row}
              columns={columns}
              onClick={() => onRowClick?.(row)}
            />
          ))}
          <AddDataRow columns={columns} onAddRow={onAddRow} />
        </tbody>
      </table>
    </div>
  );
}