"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function RootPage() {
  const router = useRouter()
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
    try {
      // Redirect to the home route
      router.push("/home")
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
    }
  }, [router])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-gray-600 mt-4">Taking you to the home page...</p>
      </div>
    </div>
  )
}
