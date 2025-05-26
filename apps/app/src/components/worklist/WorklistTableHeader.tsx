// src/components/worklist/WorklistTableHeader.tsx
import React from "react";
import type { Column } from "@/types/worklist";

interface WorklistTableHeaderProps {
  columns: Column[];
  onAddColumn: (column: Column) => void;
}

export default function WorklistTableHeader({ columns, onAddColumn }: WorklistTableHeaderProps) {
  return (
    <thead>
      <tr>
        {columns.map((col) => (
          <th key={col.key} className="bg-base-200">
            {col.label}
          </th>
        ))}
        <th className="bg-base-200 w-10">
          {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
          <button
            className="btn btn-ghost btn-xs"
            onClick={() =>
              onAddColumn({
                key: `column-${columns.length + 1}`,
                label: "New Column",
                type: "text",
              })
            }
          >
            +
          </button>
        </th>
      </tr>
    </thead>
  );
}