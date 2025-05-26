'use client'

import type React from 'react'

interface RightDrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export default function Drawer({
  open,
  onClose,
  title,
  children,
}: RightDrawerProps) {
  return (
    <div className="drawer-side">
      <label
        htmlFor="my-drawer-4"
        aria-label="close sidebar"
        className="drawer-overlay"
      />
      {children}
    </div>
  )
}
