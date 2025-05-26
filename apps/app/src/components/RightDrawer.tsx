"use client";

import type React from 'react'

interface RightDrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export default function RightDrawer({
  open,
  onClose,
  title,
  children,
}: RightDrawerProps) {
  return (
    <>
      {/* Overlay */}
      {open && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={onClose}
        />
      )}
      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-base-200 shadow-lg z-50 transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ willChange: 'transform' }}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-base-300 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{title}</h2>
            {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
            <button
              className="btn btn-ghost btn-sm btn-circle"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">{children}</div>
        </div>
      </div>
    </>
  )
}
