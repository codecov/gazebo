import { z } from 'zod'

export const MissingHeadCommitSchema = z.object({
  __typename: z.literal('MissingHeadCommit'),
  message: z.string(),
})

export type MissingHeadCommit = z.infer<typeof MissingHeadCommitSchema>
