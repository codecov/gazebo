import { z } from 'zod'

export const MissingBaseReportSchema = z.object({
  __typename: z.literal('MissingBaseReport'),
  message: z.string(),
})

export type MissingBaseRepo = z.infer<typeof MissingBaseReportSchema>
