import type { ReactNode } from 'react'
import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Activity, ChevronLeft, HeartPulse, Info, KeyRound, LogOut, MoonStar, Sun, User } from 'lucide-react'

import { useAuth } from '@/lib/auth/AuthProvider'
import { getApiVersion, hello, type ApiVersionInfo } from '@/lib/api/auth'
import { useTheme } from '@/lib/theme/ThemeProvider'
import { APP_AUTHOR, APP_COPYRIGHT, APP_NAME, APP_URL, APP_VERSION } from '@/lib/appInfo'
import { ProfileDialog } from '@/components/profile/ProfileDialog'
import { ChangePasswordDialog } from '@/components/profile/ChangePasswordDialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface AppLayoutProps {
  children: ReactNode
}

const PAGE_TITLES: Record<string, string> = {
  '/': 'Helfinka',
  '/events': 'Events',
  '/events/new': 'New Entry',
  '/summary': 'Summary',
  '/auth/login': 'Login',
}

function getPageTitle(pathname: string): string {
  return PAGE_TITLES[pathname] ?? 'Helfinka'
}

function AppLayout({ children }: AppLayoutProps) {
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const [isVersionOpen, setIsVersionOpen] = useState(false)
  const [apiVersion, setApiVersion] = useState<ApiVersionInfo | null>(null)
  const [isVersionLoading, setIsVersionLoading] = useState(false)
  const [versionError, setVersionError] = useState<string | null>(null)
  const [isAccessOpen, setIsAccessOpen] = useState(false)
  const [accessMessage, setAccessMessage] = useState<string | null>(null)
  const [accessError, setAccessError] = useState<string | null>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const { user, isAuthenticated, logout, updateUser } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  const isHomePage = location.pathname === '/'
  const pageTitle = getPageTitle(location.pathname)

  const handlePingServer = async () => {
    setAccessMessage(null)
    setAccessError(null)

    try {
      const response = await hello()
      const baseMessage =
        'Success! Access to the server is available and your stored login credentials are valid.'

      if (response.message) {
        setAccessMessage(`${response.message}\n\n${baseMessage}`)
      } else {
        setAccessMessage(baseMessage)
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('PING server failed', error)

      let details = 'Unable to validate access. Please try again.'

      if (error && typeof error === 'object') {
        const anyError = error as {
          message?: string
          response?: { data?: unknown; status?: number; statusText?: string }
        }

        const data = anyError.response?.data as
          | { message?: string }
          | string
          | undefined

        if (typeof data === 'string' && data.trim()) {
          details = data
        } else if (data && typeof data === 'object' && 'message' in data && data.message) {
          details = String(data.message)
        } else if (anyError.message) {
          details = anyError.message
        } else if (anyError.response?.status) {
          details = `Request failed with status ${anyError.response.status} ${anyError.response.statusText ?? ''}`.trim()
        }
      }

      setAccessError(details)
    } finally {
      setIsAccessOpen(true)
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
          <div className="flex items-center gap-1">
            {!isHomePage && (
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="-ml-2 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                aria-label="Go back"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <NavLink
              to="/"
              className="flex items-center gap-2 text-foreground visited:text-foreground hover:text-foreground no-underline hover:no-underline"
              end
            >
              <HeartPulse className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold tracking-tight">{pageTitle}</span>
            </NavLink>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <>
                <div className="flex flex-col items-end text-right text-xs leading-tight max-w-[100px] sm:max-w-none">
                  <span className="font-medium break-words">{user.displayName}</span>
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
                    <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
                      <User className="mr-2 h-4 w-4" />
                      <span>My Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsChangePasswordOpen(true)}>
                      <KeyRound className="mr-2 h-4 w-4" />
                      <span>Change Password</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handlePingServer}>
                      <Activity className="mr-2 h-4 w-4" />
                      <span>Validate access</span>
                    </DropdownMenuItem>
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
                    <DropdownMenuItem onClick={handleShowApiVersion}>
                      <Activity className="mr-2 h-4 w-4" />
                      <span>API Version</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsAboutOpen(true)}>
                      <Info className="mr-2 h-4 w-4" />
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
      <Dialog open={isAccessOpen} onOpenChange={setIsAccessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Validate access</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-2 text-sm">
            {accessMessage && (
              <p className="whitespace-pre-line">
                {accessMessage}
              </p>
            )}
            {accessError && <p className="text-destructive">{accessError}</p>}
          </div>
        </DialogContent>
      </Dialog>
      {isAuthenticated && user && (
        <>
          <ProfileDialog
            open={isProfileOpen}
            onOpenChange={setIsProfileOpen}
            user={user}
            onUserUpdated={updateUser}
          />
          <ChangePasswordDialog
            open={isChangePasswordOpen}
            onOpenChange={setIsChangePasswordOpen}
            userId={user.id}
          />
        </>
      )}
    </div>
  )
}

export default AppLayout
