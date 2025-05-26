// src/components/worklist/WorklistTableHeader.tsx
import React from "react";
import type { ColumnDefinition } from "@/types/worklist";

interface WorklistTableHeaderProps {
  columns: ColumnDefinition[];
  onAddColumn: (column: ColumnDefinition) => void;
}

export default function WorklistTableHeader({ columns, onAddColumn }: WorklistTableHeaderProps) {
  return (
    <thead>
      <tr>
        {columns.map((col) => (
          <th key={col.key} className="bg-base-200">
            {col.name}
          </th>
        ))}
        <th className="bg-base-200 w-10">
          {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
          <button
            className="btn btn-ghost btn-xs"
            onClick={() =>
              onAddColumn({
                key: `column-${columns.length + 1}`,
                name: "New Column",
                type: "string",
                id: `column-${columns.length + 1}`,
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