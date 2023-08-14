import { z } from 'zod'

export const RepoNotFoundErrorSchema = z.object({
  __typename: z.literal('NotFoundError'),
  message: z.string(),
})

export type RepoNotFoundError = z.infer<typeof RepoNotFoundErrorSchema>
