import type { ReactNode } from 'react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Activity, HeartPulse, LogOut, Menu, MoonStar, Sun } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '@/lib/auth/AuthProvider'
import { getApiVersion, hello, type ApiVersionInfo } from '@/lib/api/auth'
import { useTheme } from '@/lib/theme/ThemeProvider'
import { APP_AUTHOR, APP_COPYRIGHT, APP_NAME, APP_URL, APP_VERSION } from '@/lib/appInfo'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface AppLayoutProps {
  children: ReactNode
}

function AppLayout({ children }: AppLayoutProps) {
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const [isVersionOpen, setIsVersionOpen] = useState(false)
  const [apiVersion, setApiVersion] = useState<ApiVersionInfo | null>(null)
  const [isVersionLoading, setIsVersionLoading] = useState(false)
  const [versionError, setVersionError] = useState<string | null>(null)
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

  const handleShowApiVersion = async () => {
    setIsVersionLoading(true)
    setVersionError(null)

    try {
      const versionInfo = await getApiVersion()
      setApiVersion(versionInfo)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Fetching API version failed', error)
      setApiVersion(null)
      setVersionError('Unable to fetch API version.')
    } finally {
      setIsVersionLoading(false)
      setIsVersionOpen(true)
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
          <NavLink
            to="/"
            className="flex items-center gap-2 text-foreground visited:text-foreground hover:text-foreground no-underline hover:no-underline"
            end
          >
            <HeartPulse className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold tracking-tight">Helfinka</span>
          </NavLink>

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
                      <span>Test AUTH</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleShowApiVersion}>
                      <Activity className="mr-2 h-4 w-4" />
                      <span>API Version</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsAboutOpen(true)}>
                      <span>About...</span>
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
                        <span>Test AUTH</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleShowApiVersion}>
                        <Activity className="mr-2 h-4 w-4" />
                        <span>API Version</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setIsAboutOpen(true)}>
                        <span>About...</span>
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

      <Dialog open={isAboutOpen} onOpenChange={setIsAboutOpen}>
        <DialogContent>
          <DialogHeader className="flex flex-row items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
              <HeartPulse className="h-6 w-6 text-primary" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle>{APP_NAME}</DialogTitle>
              <p className="text-xs text-muted-foreground">Version {APP_VERSION}</p>
            </div>
          </DialogHeader>
          <div className="mt-4 space-y-1 text-sm">
            <p>
              <span className="font-medium">Author:</span> {APP_AUTHOR}
            </p>
            <p>
              <span className="font-medium">URL:</span>{' '}
              <a
                href={APP_URL}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                {APP_URL}
              </a>
            </p>
            <p className="pt-2 text-xs text-muted-foreground">{APP_COPYRIGHT}</p>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isVersionOpen} onOpenChange={setIsVersionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Version</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-2 text-sm">
            {isVersionLoading && <p className="text-muted-foreground">Loading API version...</p>}
            {!isVersionLoading && versionError && (
              <p className="text-destructive">{versionError}</p>
            )}
            {!isVersionLoading && !versionError && apiVersion && (
              <div className="space-y-1">
                <p>
                  <span className="font-medium">Version:</span> {apiVersion.version}
                </p>
                <p>
                  <span className="font-medium">Environment:</span> {apiVersion.environment}
                </p>
                <p>
                  <span className="font-medium">Built:</span> {apiVersion.built}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AppLayout
