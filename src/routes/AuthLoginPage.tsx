function AuthLoginPage() {
  return (
    <section className="space-y-4 max-w-md mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Authentication will be wired to your AWS REST API Gateway and JWT backend.
        </p>
      </div>
    </section>
  )
}

export default AuthLoginPage
