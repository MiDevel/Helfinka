import { useNavigate } from 'react-router-dom'

import { useAuth } from '@/lib/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {user ? `Welcome back, ${user.displayName}` : "Today's Overview"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Capture today&apos;s health data quickly, then review your history when you need it.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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
          <CardHeader>
            <CardTitle>Blood pressure</CardTitle>
            <CardDescription>Record systolic, diastolic, and heart rate.</CardDescription>
          </CardHeader>
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
          <CardHeader>
            <CardTitle>Weight</CardTitle>
            <CardDescription>Log your weight, with units.</CardDescription>
          </CardHeader>
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
          <CardHeader>
            <CardTitle>Medication</CardTitle>
            <CardDescription>Track when meds are prescribed or stopped.</CardDescription>
          </CardHeader>
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
          <CardHeader>
            <CardTitle>Note</CardTitle>
            <CardDescription>Write free-form notes and tag symptoms.</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardContent className="flex flex-col items-start justify-between gap-3 py-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium">Review your health diary</p>
            <p className="text-xs text-muted-foreground">
              Browse all entries by type and date range, with full details.
            </p>
          </div>
          <Button type="button" onClick={handleReview} className="mt-1 sm:mt-0">
            Review data
          </Button>
        </CardContent>
      </Card>
    </section>
  )
}

export default DashboardPage
