import { z } from 'zod'

export const FirstPullRequestSchema = z.object({
  __typename: z.literal('FirstPullRequest'),
  message: z.string(),
})

export type FirstPullRequest = z.infer<typeof FirstPullRequestSchema>
