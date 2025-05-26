"use client"

import type React from "react"

import { useState, useRef } from "react"
import { TableHead } from "@/components/ui/table"
import { Calendar, Hash, ToggleLeft, Text, MoreVertical } from "lucide-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"
import { ColumnMenu } from "./WorklistColumnMenu"
import type { ColumnDefinition } from "@/types/worklist"

type SortableColumnHeaderProps = {
  column: ColumnDefinition
  index: number
}

export function SortableColumnHeader({ column, index }: SortableColumnHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const headerRef = useRef<HTMLTableCellElement>(null)

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
      <div className="flex items-center justify-between whitespace-nowrap">
        <div className="flex items-center">
          {getTypeIcon()}
          {column.name}
        </div>
        {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
        <button
          className="h-5 w-5 p-0 ml-1 text-gray-500 hover:bg-gray-100 rounded-full"
          onClick={toggleMenu}
        >
          <MoreVertical className="h-3 w-3" />
        </button>
      </div>

      {/* Column menu */}
      <ColumnMenu
        column={enhancedColumn}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        position={menuPosition}
      />
    </TableHead>
  )
}
