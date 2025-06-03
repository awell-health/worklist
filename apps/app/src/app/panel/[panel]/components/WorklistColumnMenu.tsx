"use client"

import { useRef, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { ArrowUpDown, Database, Hash, Calendar, Text, ToggleLeft } from "lucide-react"
import type { ColumnDefinition } from "@/types/worklist"

type ColumnMenuProps = {
  column: ColumnDefinition
  isOpen: boolean
  onClose: () => void
  position: { top: number; left: number }
  onSort: () => void
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null
  filterValue: string
  onFilter: (value: string) => void
}

export function ColumnMenu({ column, isOpen, onClose, position, onSort, sortConfig, filterValue, onFilter }: ColumnMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [localFilterValue, setLocalFilterValue] = useState(filterValue)

  // Set mounted state after component mounts (for SSR compatibility)
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Update local filter value when prop changes
  useEffect(() => {
    setLocalFilterValue(filterValue)
  }, [filterValue])

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  // Get sort label based on column type and current sort state
  const getSortLabel = () => {
    const isSorted = sortConfig?.key === column.key
    const isAscending = sortConfig?.direction === 'asc'

    switch (column.type) {
      case "number":
        return isSorted 
          ? (isAscending ? "Sort large → small" : "Sort small → large")
          : "Sort small → large"
      case "date":
        return isSorted
          ? (isAscending ? "Sort new → old" : "Sort old → new")
          : "Sort old → new"
      case "boolean":
        return isSorted
          ? (isAscending ? "Sort true → false" : "Sort false → true")
          : "Sort false → true"
      default:
        return isSorted
          ? (isAscending ? "Sort Z → A" : "Sort A → Z")
          : "Sort A → Z"
    }
  }

  // Get type icon based on column type
  const getTypeIcon = () => {
    switch (column.type) {
      case "date":
        return <Calendar className="h-3.5 w-3.5 mr-2 text-gray-500" />
      case "number":
        return <Hash className="h-3.5 w-3.5 mr-2 text-gray-500" />
      case "boolean":
        return <ToggleLeft className="h-3.5 w-3.5 mr-2 text-gray-500" />
      default:
        return <Text className="h-3.5 w-3.5 mr-2 text-gray-500" />
    }
  }

  // Handle filter input changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalFilterValue(e.target.value)
  }

  // Apply filter and close menu
  const handleFilterApply = () => {
    onFilter(localFilterValue)
    onClose()
  }

  // Clear filter
  const handleFilterClear = () => {
    onFilter('')
    onClose()
  }

  if (!isOpen || !mounted) return null

  const menuContent = (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white border border-gray-200 rounded-md shadow-md w-64"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="py-1">
        {/* Sort option */}
        {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
        <button
          className="flex items-center w-full px-3 py-2 text-xs font-normal text-left hover:bg-gray-50 border-b border-gray-100"
          onClick={() => {
            onSort()
            onClose()
          }}
        >
          <ArrowUpDown className="h-3.5 w-3.5 mr-2 text-gray-500" />
          {getSortLabel()}
        </button>

        {/* Filter section */}
        <div className="px-3 py-2 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-gray-500">Filter:</label>
            {filterValue && (
              <button
                className="text-xs text-blue-500 hover:text-blue-600"
                onClick={handleFilterClear}
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={localFilterValue}
              onChange={handleFilterChange}
              className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Filter..."
            />
            <button
              className="px-2 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600"
              onClick={handleFilterApply}
            >
              Apply
            </button>
          </div>
        </div>

        {/* Type */}
        <div className="flex items-center w-full px-3 py-2 text-xs font-normal text-left border-b border-gray-100">
          {getTypeIcon()}
          <div className="flex flex-col">
            <span>Type: {column.type.charAt(0).toUpperCase() + column.type.slice(1)}</span>
            <span>Key: <span className="text-[10px] text-gray-400"> {column.key}</span></span>
          </div>
        </div>

        {/* Source */}
        <div className="flex items-center w-full px-3 py-2 text-xs font-normal text-left border-b border-gray-100">
          <Database className="h-3.5 w-3.5 mr-2 text-gray-500" />
          <span>Source: {column.source || "Unknown"}</span>
        </div>

        {/* Multiline text field for column description */}
        <div className="px-3 py-2 border-b border-gray-100">
          <label htmlFor="column-description" className="block text-xs text-gray-500 mb-1">Column Description:</label>
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
          <textarea
            className="textarea min-h-[60px] text-xs resize-y w-full p-2 border border-gray-200 rounded"
            placeholder="Enter a description or prompt for this column..."
            onClick={(e: React.MouseEvent<HTMLTextAreaElement>) => e.stopPropagation()}
          />
        </div>

        {/* Options with colors (if available) */}
        {column.options && column.options.length > 0 && (
          <div className="px-3 py-2 text-xs font-normal">
            <div className="mb-1 text-gray-500">Options:</div>
            {column.options.map((option, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              <div key={index} className="flex items-center py-1">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: option.color }} />
                <span>{option.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  // Use portal to render the menu at the document body level
  return createPortal(menuContent, document.body)
}
