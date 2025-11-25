import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { HeartPulse } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface AppLayoutProps {
  children: ReactNode
}

function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold tracking-tight">Helfinka</span>
          </div>

          <nav className="flex items-center gap-4 text-sm font-medium">
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
            <Button asChild size="sm">
              <NavLink to="/events/new">New Entry</NavLink>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  )
}

export default AppLayout
