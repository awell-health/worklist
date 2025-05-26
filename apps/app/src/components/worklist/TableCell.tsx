// src/components/worklist/TableCell.tsx
import type { ColumnDefinition } from '@/types/worklist'

interface TableCellProps {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  value: any
  column: ColumnDefinition
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  onEdit?: (value: any) => void
}

export default function TableCell({ value, column, onEdit }: TableCellProps) {
  const renderCellContent = () => {
    switch (column.type) {
      case 'date':
        return new Date(value).toLocaleDateString()

      // case 'select':
      //   return (
      //     <select
      //       className="select select-bordered select-sm"
      //       value={value}
      //       onChange={(e) => onEdit?.(e.target.value)}
      //     >
      //       <option value="">Select...</option>
      //         {column.options?.map((option) => (
      //         <option key={option.value} value={option.value}>
      //           {option.value}
      //         </option>
      //       ))}
      //     </select>
      //   )

      case 'tasks':
        return Array.isArray(value) ? (
          <div className="flex flex-wrap gap-1">
            {value.map((task, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              <span key={index} className="badge badge-sm">
                {task}
              </span>
            ))}
          </div>
        ) : null

      default:
        return value
    }
  }

  return <td className="px-4 py-2">{renderCellContent()}</td>
}
