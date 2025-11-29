import { z } from 'zod'

import { userSchema } from '@/types/user'

export const jwtPayloadSchema = z.object({
  sub: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  sessionId: z.string(),
  roles: z.array(z.string()),
  iat: z.number(),
  exp: z.number(),
})

export type JwtPayload = z.infer<typeof jwtPayloadSchema>

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export type LoginRequest = z.infer<typeof loginRequestSchema>

export const loginResponseSchema = z.object({
  token: z.string(),
  user: userSchema,
})

export type LoginResponse = z.infer<typeof loginResponseSchema>
