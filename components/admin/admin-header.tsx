"use client"

import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { LogOut, User } from 'lucide-react'

export function AdminHeader() {
  const { isAuthenticated, logout } = useAuth()
  const router = useRouter()

  if (!isAuthenticated) return null

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <div className="border-b bg-muted/40">
      <div className="container flex items-center justify-between py-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>Logged in as Admin</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  )
}
