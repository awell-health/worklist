"use client";
import React from "react";
import { useDrawer } from '@/contexts/DrawerContext'
import PatientDetails from '@/components/worklist/PatientDetails'
import type { Column, Patient } from '@/types/worklist'

interface WorklistTableRowProps {
  row: Patient
  columns: Column[]
  onClick?: () => void
}

export default function WorklistTableRow({
  row,
  columns,
  onClick,
}: WorklistTableRowProps) {
  const { openDrawer } = useDrawer()

  const handleRowClick = () => {
    openDrawer(
      <PatientDetails patient={row} />,
      `Patient Details - ${row.name}`,
    )
  }

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
    <tr className="hover:bg-base-200 cursor-pointer" onClick={onClick || handleRowClick}>
      {columns.map((col) => (
        <td key={`${row.id}-${col.key}`}>
          {col.type === 'tasks' ? (
            <div className="flex gap-1">
              {row.tasks?.map((task, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                <span key={i} className="badge badge-sm">
                  {task}
                </span>
              ))}
            </div>
          ) : (
            row[col.key]
          )}
        </td>
      ))}
      <td>
        {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
        <button
          className="btn btn-ghost btn-xs"
          onClick={(e) => {
            e.stopPropagation()
            // Add your row actions here
          }}
        >
          ⋮
        </button>
      </td>
    </tr>
  )
}
