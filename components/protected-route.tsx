"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login")
      } else if (allowedRoles && !allowedRoles.includes(user?.role || "")) {
        router.push("/dashboard")
      }
    }
  }, [isAuthenticated, isLoading, router, user, allowedRoles])

  if (isLoading) {
    return <div className="container py-6">Loading...</div>
  }

  if (!isAuthenticated) {
    return null
  }

  if (allowedRoles && !allowedRoles.includes(user?.role || "")) {
    return null
  }

  return <>{children}</>
}
