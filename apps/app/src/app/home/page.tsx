"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Helper function to safely convert error to string
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message
    }
    if (typeof error === "string") {
      return error
    }
    return "An unexpected error occurred"
  }

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={() => setError(null)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Worklist App</h1>
          <p className="text-xl text-gray-600">Multi provider worklist management</p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Panels</h2>
            <p className="text-gray-600 mb-4">Manage and view your worklist panels</p>
            <Link
              href="/panel"
              className="inline-block px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              View Panels
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Team</h2>
            <p className="text-gray-600 mb-4">Collaborate with your team members</p>
            <Link
              href="/team"
              className="inline-block px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              View Team
            </Link>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link href="/login" className="text-blue-500 hover:text-blue-600 underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}
