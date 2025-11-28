import { useNavigate } from 'react-router-dom'

import { HeartPulse, ListChecks, NotebookText, Pill, Scale } from 'lucide-react'

import { useAuth } from '@/lib/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleQuickAdd = (type: 'BP' | 'WEIGHT' | 'MED' | 'NOTE') => {
    navigate(`/events/new?type=${encodeURIComponent(type)}`)
  }

  const handleReview = () => {
    navigate('/events')
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {user ? `Hello, ${user.displayName}` : "Today's Overview"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Capture today&apos;s health data quickly, then review your history when you need it.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card
          role="button"
          tabIndex={0}
          className="hover:bg-accent/40 cursor-pointer transition-colors"
          onClick={() => handleQuickAdd('BP')}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              handleQuickAdd('BP')
            }
          }}
        >
          <CardContent className="flex h-24 flex-col items-center justify-center gap-2 text-center">
            <HeartPulse className="h-10 w-10 text-primary" aria-hidden="true" />
            <p className="text-sm font-medium">Blood pressure</p>
          </CardContent>
        </Card>

        <Card
          role="button"
          tabIndex={0}
          className="hover:bg-accent/40 cursor-pointer transition-colors"
          onClick={() => handleQuickAdd('WEIGHT')}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              handleQuickAdd('WEIGHT')
            }
          }}
        >
          <CardContent className="flex h-24 flex-col items-center justify-center gap-2 text-center">
            <Scale className="h-10 w-10 text-primary" aria-hidden="true" />
            <p className="text-sm font-medium">Weight</p>
          </CardContent>
        </Card>

        <Card
          role="button"
          tabIndex={0}
          className="hover:bg-accent/40 cursor-pointer transition-colors"
          onClick={() => handleQuickAdd('MED')}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              handleQuickAdd('MED')
            }
          }}
        >
          <CardContent className="flex h-24 flex-col items-center justify-center gap-2 text-center">
            <Pill className="h-10 w-10 text-primary" aria-hidden="true" />
            <p className="text-sm font-medium">Medication</p>
          </CardContent>
        </Card>

        <Card
          role="button"
          tabIndex={0}
          className="hover:bg-accent/40 cursor-pointer transition-colors"
          onClick={() => handleQuickAdd('NOTE')}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              handleQuickAdd('NOTE')
            }
          }}
        >
          <CardContent className="flex h-24 flex-col items-center justify-center gap-2 text-center">
            <NotebookText className="h-10 w-10 text-primary" aria-hidden="true" />
            <p className="text-sm font-medium">Note</p>
          </CardContent>
        </Card>
      </div>

      <Card
        role="button"
        tabIndex={0}
        className="hover:bg-accent/40 cursor-pointer transition-colors"
        onClick={handleReview}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleReview()
          }
        }}
      >
        <CardContent className="flex items-center justify-between gap-3 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <ListChecks className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Review your health diary</p>
              <p className="text-xs text-muted-foreground">
                Browse all entries by type and date range, with full details.
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="pointer-events-none opacity-70">
            <ListChecks className="h-4 w-4" aria-hidden="true" />
          </Button>
        </CardContent>
      </Card>
    </section>
  )
}

export default DashboardPage
