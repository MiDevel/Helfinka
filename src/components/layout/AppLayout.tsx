import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { Activity, HeartPulse, LogOut, Menu, MoonStar, Sun } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '@/lib/auth/AuthProvider'
import { hello } from '@/lib/api/auth'
import { useTheme } from '@/lib/theme/ThemeProvider'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface AppLayoutProps {
  children: ReactNode
}

function AppLayout({ children }: AppLayoutProps) {
  const { user, isAuthenticated, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const handlePingServer = async () => {
    try {
      const response = await hello()
      toast.success(response.message || 'Server is reachable.')
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('PING server failed', error)
      toast.error('PING failed: unable to reach the server.')
    }
  }

  const handleLogout = () => {
    logout().catch(() => {
      // Ignore logout errors in UI handler
    })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold tracking-tight">Helfinka</span>
          </div>

          <nav className="hidden items-center gap-4 text-sm font-medium md:flex">
            <NavLink
              to="/"
              className={({ isActive }) =>
                cn(
                  'text-muted-foreground transition-colors hover:text-foreground',
                  isActive && 'text-foreground'
                )
              }
              end
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/events"
              className={({ isActive }) =>
                cn(
                  'text-muted-foreground transition-colors hover:text-foreground',
                  isActive && 'text-foreground'
                )
              }
            >
              Events
            </NavLink>
            <NavLink
              to="/summary"
              className={({ isActive }) =>
                cn(
                  'text-muted-foreground transition-colors hover:text-foreground',
                  isActive && 'text-foreground'
                )
              }
            >
              Summary
            </NavLink>
          </nav>

          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <>
                <div className="hidden flex-col items-end text-right text-xs leading-tight sm:flex">
                  <span className="font-medium">{user.displayName}</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full border-border/70"
                    >
                      <span className="text-sm font-semibold">
                        {user.displayName.charAt(0).toUpperCase()}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Account</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <NavLink to="/">Dashboard</NavLink>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <NavLink to="/events">Events</NavLink>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={toggleTheme}>
                      {theme === 'dark' ? (
                        <>
                          <Sun className="mr-2 h-4 w-4" />
                          <span>Light mode</span>
                        </>
                      ) : (
                        <>
                          <MoonStar className="mr-2 h-4 w-4" />
                          <span>Dark mode</span>
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handlePingServer}>
                      <Activity className="mr-2 h-4 w-4" />
                      <span>PING server</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button asChild variant="outline" size="sm">
                <NavLink to="/auth/login">Login</NavLink>
              </Button>
            )}

            <div className="hidden md:block">
              <Button asChild size="sm">
                <NavLink to="/events/new">New Entry</NavLink>
              </Button>
            </div>

            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Menu className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Navigate</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <NavLink to="/">Dashboard</NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <NavLink to="/events">Events</NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <NavLink to="/summary">Summary</NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <NavLink to="/events/new">New Entry</NavLink>
                  </DropdownMenuItem>
                  {isAuthenticated && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={toggleTheme}>
                        {theme === 'dark' ? (
                          <>
                            <Sun className="mr-2 h-4 w-4" />
                            <span>Light mode</span>
                          </>
                        ) : (
                          <>
                            <MoonStar className="mr-2 h-4 w-4" />
                            <span>Dark mode</span>
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handlePingServer}>
                        <Activity className="mr-2 h-4 w-4" />
                        <span>PING server</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  )
}

export default AppLayout
