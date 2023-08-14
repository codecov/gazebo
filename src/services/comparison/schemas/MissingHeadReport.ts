import { z } from 'zod'

export const MissingHeadReportSchema = z.object({
  __typename: z.literal('MissingHeadReport'),
  message: z.string(),
})

export type MissingHeadReport = z.infer<typeof MissingHeadReportSchema>
