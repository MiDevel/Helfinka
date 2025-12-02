import type { FormEvent } from 'react'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { updateUserPassword } from '@/lib/api/users'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface ChangePasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
}

function ChangePasswordDialog({ open, onOpenChange, userId }: ChangePasswordDialogProps) {
  const [oldPassword, setOldPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const resetState = () => {
    setOldPassword('')
    setPassword('')
    setConfirmPassword('')
    setShowOldPassword(false)
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetState()
    }

    onOpenChange(nextOpen)
  }

  const isOldPasswordInvalid = !oldPassword
  const isNewPasswordTooShort = password.length > 0 && password.length < 8
  const isNewPasswordEmpty = !password
  const isConfirmPasswordEmpty = !confirmPassword
  const doNewPasswordsMismatch = password.length >= 8 && confirmPassword.length > 0 && password !== confirmPassword

  const isFormInvalid =
    isOldPasswordInvalid ||
    isNewPasswordEmpty ||
    isConfirmPasswordEmpty ||
    isNewPasswordTooShort ||
    doNewPasswordsMismatch

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (isFormInvalid) {
      toast.error('Please fix the highlighted fields.')
      return
    }

    try {
      setSubmitting(true)

      await updateUserPassword({
        userId,
        payload: {
          oldPassword,
          password,
        },
      })

      toast.success('Password changed successfully.')
      handleOpenChange(false)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Changing password failed', error)
      toast.error('Unable to change password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>

          <div className="space-y-1 text-sm">
            <label
              className="block text-xs font-medium text-muted-foreground"
              htmlFor="change-password-old"
            >
              Current password
            </label>
            <div className="relative flex items-center">
              <Input
                id="change-password-old"
                type={showOldPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={oldPassword}
                onChange={(event) => setOldPassword(event.target.value)}
                aria-invalid={isOldPasswordInvalid ? 'true' : undefined}
              />
              <button
                type="button"
                className="absolute right-2 inline-flex h-6 w-6 items-center justify-center text-muted-foreground"
                onClick={() => setShowOldPassword((prev) => !prev)}
              >
                {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Current password is required.</p>
          </div>

          <div className="space-y-1 text-sm">
            <label
              className="block text-xs font-medium text-muted-foreground"
              htmlFor="change-password-new"
            >
              New password, min. 8 chars
            </label>
            <div className="relative flex items-center">
              <Input
                id="change-password-new"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={isNewPasswordTooShort ? 'true' : undefined}
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

          <div className="space-y-1 text-sm">
            <label
              className="block text-xs font-medium text-muted-foreground"
              htmlFor="change-password-confirm"
            >
              Confirm new password
            </label>
            <div className="relative flex items-center">
              <Input
                id="change-password-confirm"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                aria-invalid={doNewPasswordsMismatch ? 'true' : undefined}
              />
              <button
                type="button"
                className="absolute right-2 inline-flex h-6 w-6 items-center justify-center text-muted-foreground"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <DialogFooter className="mt-2 flex flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting || isFormInvalid}>
              {submitting ? 'Changing…' : 'Change password'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { ChangePasswordDialog }
