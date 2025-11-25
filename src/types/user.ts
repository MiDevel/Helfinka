import { z } from 'zod'

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  roles: z.array(z.string()),
})

export type User = z.infer<typeof userSchema>
