import type React from "react"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names and resolves Tailwind CSS conflicts
 * Use this utility for all conditional class name logic
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Creates a consistent style object for absolute positioning elements
 * Use this instead of inline styles for positioning
 */
export function positionStyle(
  top?: number | string,
  right?: number | string,
  bottom?: number | string,
  left?: number | string,
) {
  const style: React.CSSProperties = {}

  if (top !== undefined) style.top = typeof top === "number" ? `${top}px` : top
  if (right !== undefined) style.right = typeof right === "number" ? `${right}px` : right
  if (bottom !== undefined) style.bottom = typeof bottom === "number" ? `${bottom}px` : bottom
  if (left !== undefined) style.left = typeof left === "number" ? `${left}px` : left

  return style
}

