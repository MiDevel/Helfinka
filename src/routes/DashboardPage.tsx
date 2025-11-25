import { useAuth } from '@/lib/auth/AuthProvider'

function DashboardPage() {
  const { user } = useAuth()

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {user ? `Welcome back, ${user.displayName}` : "Today's Overview"}
        </h1>
        <p className="text-sm text-muted-foreground">
          This dashboard will show today&apos;s entries, quick stats, and summaries based on your health diary.
        </p>
      </div>
    </section>
  )
}

export default DashboardPage
