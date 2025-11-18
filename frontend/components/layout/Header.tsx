"use client"

import { Menu, LogOut, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useUIStore } from "@/lib/stores/ui-store"
import { useLogout } from "@/lib/hooks/use-auth"
import { useAuthStore } from "@/lib/stores/auth-store"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { toast } from "sonner"
import { handleApiError } from "@/lib/utils/error-handler"
import { useState, useEffect } from "react"

export function Header() {
  const router = useRouter()
  const { toggleSidebar } = useUIStore()
  const { user } = useAuthStore()
  const logoutMutation = useLogout()
  const pathname = usePathname()

  // Local state for user (to handle `localStorage`)
  const [localUser, setLocalUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setLocalUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync()
      toast.success("Logged out successfully")
      router.push("/login")
    } catch (error) {
      toast.error(handleApiError(error))
    }
  }

  const isLandingPage = pathname === "/" || pathname === "/pricing"

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background">
      {/* Mobile sidebar toggle */}
      <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
        <Menu className="h-5 w-5" />
      </Button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Left-side links (Home, Pricing, etc.) */}
      {isLandingPage && (
        <div className="flex items-center gap-6">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <Link href="/pricing" className="hover:text-primary">
            Pricing
          </Link>
        </div>
      )}

      {/* Right-side user navigation (Login/SignUp or Profile/Logout) */}
      {localUser || user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                {(localUser?.name || user?.name)?.charAt(0).toUpperCase() || "U"}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{localUser?.name || user?.name}</p>
              <p className="text-xs text-muted-foreground">{localUser?.email || user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Button variant="ghost" className="w-full justify-start">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="outline">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button>Get Started</Button>
          </Link>
        </div>
      )}
    </header>
  )
}
