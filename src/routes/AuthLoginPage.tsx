import type { FormEvent } from 'react'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { type Location, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '@/lib/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

function AuthLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailTouched, setEmailTouched] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = ((location.state as { from?: Location } | undefined)?.from?.pathname) ?? '/'

  const isEmailEmpty = !email
  const isEmailFormatValid = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isEmailInvalid = !isEmailEmpty && !isEmailFormatValid
  const isPasswordEmpty = !password

  const isFormInvalid = isEmailInvalid || isEmailEmpty || isPasswordEmpty

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isFormInvalid) {
      setEmailTouched(true)
      return
    }

    setError(null)
    setSubmitting(true)

    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Login failed', err)
      setError('Invalid email or password. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Sign in to access your private Helfinka health diary.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onBlur={() => setEmailTouched(true)}
                disabled={submitting}
                aria-invalid={emailTouched && isEmailInvalid ? 'true' : undefined}
              />
              <p className="text-xs text-muted-foreground">Use a valid email address format.</p>
            </div>
            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative flex items-center">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={submitting}
                  aria-invalid={isPasswordEmpty ? 'true' : undefined}
                />
                <button
                  type="button"
                  className="absolute right-2 inline-flex h-6 w-6 items-center justify-center text-muted-foreground"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={submitting || isFormInvalid}>
              {submitting ? 'Signing in...' : 'Sign in'}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Your health information is private. Do not share your login details with anyone.
            </p>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

export default AuthLoginPage
