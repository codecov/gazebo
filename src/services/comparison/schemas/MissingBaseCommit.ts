import { z } from 'zod'

export const MissingBaseCommitSchema = z.object({
  __typename: z.literal('MissingBaseCommit'),
  message: z.string(),
})

export type MissingBaseCommit = z.infer<typeof MissingBaseCommitSchema>
