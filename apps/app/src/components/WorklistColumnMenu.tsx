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
}

export function ColumnMenu({ column, isOpen, onClose, position }: ColumnMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  // Set mounted state after component mounts (for SSR compatibility)
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

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

  // Get sort label based on column type
  const getSortLabel = () => {
    switch (column.type) {
      case "number":
        return "Sort small → large"
      case "date":
        return "Sort old → new"
      case "boolean":
        return "Sort false → true"
      default:
        return "Sort A → Z"
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
          onClick={() => console.log(`Sort ${column.name}`)}
        >
          <ArrowUpDown className="h-3.5 w-3.5 mr-2 text-gray-500" />
          {getSortLabel()}
        </button>

        {/* Type */}
        <div className="flex items-center w-full px-3 py-2 text-xs font-normal text-left border-b border-gray-100">
          {getTypeIcon()}
          <span>Type: {column.type.charAt(0).toUpperCase() + column.type.slice(1)}</span>
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
