"use client"

import Link from "next/link"

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-6">Welcome to Panels</h1>
      <p className="text-lg mb-8 text-center max-w-2xl">
        Manage your organization's panels and team members efficiently.
      </p>

      <div className="flex gap-4">
        <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Dashboard
        </Link>
        <Link
          href="/panel"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
        >
          View Panels
        </Link>
      </div>
    </div>
  )
}
