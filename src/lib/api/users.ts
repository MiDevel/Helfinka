import { z } from 'zod'

import { api } from '@/lib/api/client'
import { userSchema, type User } from '@/types/user'

export const updateUserProfileRequestSchema = z
  .object({
    email: z.string().email().optional(),
    displayName: z.string().optional(),
  })
  .refine((data) => data.email !== undefined || data.displayName !== undefined, {
    message: 'At least one of email or displayName must be provided',
  })

export type UpdateUserProfileRequest = z.infer<typeof updateUserProfileRequestSchema>

export const updateUserPasswordRequestSchema = z.object({
  oldPassword: z.string().min(1),
  password: z.string().min(1),
})

export type UpdateUserPasswordRequest = z.infer<typeof updateUserPasswordRequestSchema>

export async function updateUserProfile(params: {
  userId: string
  payload: UpdateUserProfileRequest
}): Promise<User> {
  const body = updateUserProfileRequestSchema.parse(params.payload)

  const response = await api.patch(`/users/${params.userId}`, body)

  return userSchema.parse((response.data as { user: unknown }).user)
}

export async function updateUserPassword(params: {
  userId: string
  payload: UpdateUserPasswordRequest
}): Promise<void> {
  const body = updateUserPasswordRequestSchema.parse(params.payload)

  await api.patch(`/users/${params.userId}`, body)
}
