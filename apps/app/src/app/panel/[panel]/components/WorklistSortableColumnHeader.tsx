"use client"

import type React from "react"

import { TableHead } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { ColumnDefinition } from "@/types/worklist"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Calendar, Hash, MoreVertical, Text, ToggleLeft } from "lucide-react"
import { useRef, useState } from "react"
import { ColumnMenu } from "./WorklistColumnMenu"

type SortableColumnHeaderProps = {
  column: ColumnDefinition
  index: number
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null
  onSort: () => void
  filterValue: string
  onFilter: (value: string) => void
  onColumnUpdate: (updates: Partial<ColumnDefinition>) => void
}

export function SortableColumnHeader({ column, index, sortConfig, onSort, filterValue, onFilter, onColumnUpdate }: SortableColumnHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const [isFilterVisible, setIsFilterVisible] = useState(false)
  const headerRef = useRef<HTMLTableCellElement>(null)
  const filterInputRef = useRef<HTMLInputElement>(null)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id || `column-${index}`,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.8 : 1,
    cursor: "grab",
    width: column.name === "Patient Name" ? "140px" : "auto", // Snug width for Patient Name
  }

  // Get the appropriate icon based on column type
  const getTypeIcon = () => {
    switch (column.type) {
      case "date":
        return <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
      case "number":
        return <Hash className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
      case "boolean":
        return <ToggleLeft className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
      default:
        return <Text className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
    }
  }

  // Get sort indicator
  const getSortIndicator = () => {
    if (!sortConfig || sortConfig.key !== column.key) return null
    return sortConfig.direction === 'asc' ? '↑' : '↓'
  }

  // Toggle menu open/closed and calculate position
  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!isMenuOpen && headerRef.current) {
      const rect = headerRef.current.getBoundingClientRect()
      const menuWidth = 264 // Menu width (260px) + some margin

      // Check if this is a leftmost column (close to the left edge of the screen)
      const isLeftmostColumn = rect.left < menuWidth

      // For leftmost columns, align menu with left edge of column
      // For other columns, align with right edge but ensure it stays on screen
      const left = isLeftmostColumn ? rect.left + window.scrollX : Math.max(0, rect.right - menuWidth + window.scrollX)

      setMenuPosition({
        top: rect.bottom + window.scrollY,
        left: left,
      })
    }

    setIsMenuOpen(!isMenuOpen)
  }

  // Sample options for demonstration
  const sampleOptions =
    column.type === "boolean"
      ? [
          { value: "True", color: "#10B981" }, // green-500
          { value: "False", color: "#EF4444" }, // red-500
        ]
      : undefined

  // Enhanced column with sample source and options
  const enhancedColumn = {
    ...column,
    source: "Metriport",
    options: sampleOptions,
  }

  // Handle filter input changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilter(e.target.value)
  }

  // Show filter input when clicking the filter icon
  const handleFilterClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFilterVisible(true)
    // Focus the input after it's rendered
    setTimeout(() => {
      filterInputRef.current?.focus()
    }, 0)
  }

  // Handle filter input blur
  const handleFilterBlur = () => {
    setIsFilterVisible(false)
  }

  // Handle filter input keydown
  const handleFilterKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsFilterVisible(false)
    }
  }

  return (
    <TableHead
      ref={(node) => {
        setNodeRef(node)
        if (headerRef) {
          headerRef.current = node
        }
      }}
      style={style}
      className={cn("text-xs font-normal text-gray-700 p-2 border-r border-gray-200 relative")}
      {...attributes}
      {...listeners}
    >
      <div className="flex flex-col">
        <div className="flex items-center justify-between whitespace-nowrap">
          <div 
            className="flex items-center cursor-pointer hover:text-gray-900"
            onClick={onSort}
          >
            {getTypeIcon()}
            <div className="flex flex-col">
              <span>{column.name}</span>
            </div>
            <span className="ml-1 text-gray-500">{getSortIndicator()}</span>
          </div>
          <div className="flex items-center">
            {/* Filter button */}
            <button
              className={cn(
                "h-5 w-5 p-0 mr-1 text-gray-500 hover:bg-gray-100 rounded-full",
                filterValue && "text-blue-500"
              )}
              onClick={handleFilterClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
            </button>
            {/* Menu button */}
            <button
              className="h-5 w-5 p-0 text-gray-500 hover:bg-gray-100 rounded-full"
              onClick={toggleMenu}
            >
              <MoreVertical className="h-3 w-3" />
            </button>
          </div>
        </div>
        
        {/* Filter input */}
        {isFilterVisible && (
          <div className="mt-1">
            <input
              ref={filterInputRef}
              type="text"
              value={filterValue}
              onChange={handleFilterChange}
              onBlur={handleFilterBlur}
              onKeyDown={handleFilterKeyDown}
              className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Filter..."
            />
          </div>
        )}
      </div>

      {/* Column menu */}
      <ColumnMenu
        column={enhancedColumn}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        position={menuPosition}
        onSort={onSort}
        sortConfig={sortConfig}
        filterValue={filterValue}
        onFilter={onFilter}
        onColumnUpdate={onColumnUpdate}
      />
    </TableHead>
  )
}
