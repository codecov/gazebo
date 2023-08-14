import { z } from 'zod'

export const RepoOwnerNotActivatedErrorSchema = z.object({
  __typename: z.literal('OwnerNotActivatedError'),
  message: z.string(),
})

export type RepoOwnerNotActivatedError = z.infer<
  typeof RepoOwnerNotActivatedErrorSchema
>
