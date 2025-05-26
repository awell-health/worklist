// src/components/worklist/ColumnHeader.tsx
import type { Column } from '@/types/worklist'

interface ColumnHeaderProps {
  column: Column
  onSort?: () => void
  sortDirection?: 'asc' | 'desc' | null
}

export default function ColumnHeader({
  column,
  onSort,
  sortDirection,
}: ColumnHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <span>{column.label}</span>
      {onSort && (
        // biome-ignore lint/a11y/useButtonType: <explanation>
        <button onClick={onSort} className="btn btn-ghost btn-xs">
          {sortDirection === 'asc' ? '↑' : sortDirection === 'desc' ? '↓' : '↕'}
        </button>
      )}
    </div>
  )
}
