import { z } from 'zod'

export const UnknownFlagsSchema = z.object({
  __typename: z.literal('UnknownFlags'),
  message: z.string(),
})
