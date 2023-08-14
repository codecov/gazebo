import { z } from 'zod'

export const MissingComparisonSchema = z.object({
  __typename: z.literal('MissingComparison'),
  message: z.string(),
})

export type MissingComparison = z.infer<typeof MissingComparisonSchema>
