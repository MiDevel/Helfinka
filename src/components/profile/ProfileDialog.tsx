import type { FormEvent } from 'react'
import { useState, useEffect } from 'react'

import { updateUserProfile, type UpdateUserProfileRequest } from '@/lib/api/users'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import type { User } from '@/types/user'
import { toast } from 'sonner'

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
  onUserUpdated?: (user: User) => void
}

function ProfileDialog({ open, onOpenChange, user, onUserUpdated }: ProfileDialogProps) {
  const [email, setEmail] = useState(user.email)
  const [displayName, setDisplayName] = useState(user.displayName)
  const [submitting, setSubmitting] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)
  const [displayNameTouched, setDisplayNameTouched] = useState(false)

  useEffect(() => {
    if (open) {
      setEmail(user.email)
      setDisplayName(user.displayName)
      setEmailTouched(false)
      setDisplayNameTouched(false)
    }
  }, [open, user.email, user.displayName])

  const trimmedDisplayName = displayName.trim()
  const isEmailEmpty = !email
  const isEmailFormatValid = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isEmailInvalid = !isEmailEmpty && !isEmailFormatValid
  const isDisplayNameInvalid = trimmedDisplayName.length === 0

  const isFormInvalid = isEmailInvalid || isDisplayNameInvalid

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    const payload: UpdateUserProfileRequest = {}

    if (email !== user.email) {
      payload.email = email
    }

    if (trimmedDisplayName !== user.displayName) {
      payload.displayName = trimmedDisplayName
    }

    if (!Object.keys(payload).length) {
      toast.info('Nothing to update.')
      onOpenChange(false)
      return
    }

    try {
      setSubmitting(true)

      const updatedUser = await updateUserProfile({
        userId: user.id,
        payload,
      })

      if (onUserUpdated) {
        onUserUpdated(updatedUser)
      }

      toast.success('Profile updated.')
      onOpenChange(false)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Updating profile failed', error)
      toast.error('Unable to update profile.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>My Profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-1 text-sm">
            <label className="block text-xs font-medium text-muted-foreground" htmlFor="profile-email">
              Email
            </label>
            <Input
              id="profile-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onBlur={() => setEmailTouched(true)}
              aria-invalid={emailTouched && isEmailInvalid ? 'true' : undefined}
            />
            <p className="text-xs text-muted-foreground">Use a valid email address format.</p>
          </div>

          <div className="space-y-1 text-sm">
            <label
              className="block text-xs font-medium text-muted-foreground"
              htmlFor="profile-display-name"
            >
              Display name
            </label>
            <Input
              id="profile-display-name"
              autoComplete="name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              onBlur={() => setDisplayNameTouched(true)}
              aria-invalid={displayNameTouched && isDisplayNameInvalid ? 'true' : undefined}
            />
            <p className="text-xs text-muted-foreground">Display name cannot be empty.</p>
          </div>

          <DialogFooter className="mt-2 flex flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting || isFormInvalid}>
              {submitting ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { ProfileDialog }
