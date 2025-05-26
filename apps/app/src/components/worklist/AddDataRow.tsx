"use client";
// src/components/worklist/AddDataRow.tsx
import React from 'react'
import type { ColumnDefinition, Patient } from '@/types/worklist'

interface AddDataRowProps {
  columns: ColumnDefinition[]
  onAddRow: (row: Patient) => void
}

export default function AddDataRow({ columns, onAddRow }: AddDataRowProps) {
  return (
    <tr className="border-t border-base-300">
      <td colSpan={columns.length + 1}>
        {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
        <button
          className="btn btn-ghost btn-sm w-full text-left"
          onClick={() =>
            onAddRow({
              id: String(Date.now()),
              name: '',
              dateOfBirth: '',
              gender: '',
              tasks: [],
            })
          }
        >
          + Add data
        </button>
      </td>
    </tr>
  )
}
