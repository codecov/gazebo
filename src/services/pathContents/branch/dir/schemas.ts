import { z } from 'zod'

import { UnknownFlagsSchema } from 'services/impactedFiles/schemas/UnknownFlags'
import { RepositoryConfigSchema } from 'services/repo/useRepoConfig'

export const BasePathContentSchema = z.object({
  hits: z.number(),
  misses: z.number(),
  partials: z.number(),
  lines: z.number(),
  name: z.string(),
  path: z.string(),
  percentCovered: z.number(),
})

export const PathContentFileSchema = BasePathContentSchema.extend({
  __typename: z.literal('PathContentFile'),
})

export const PathContentDirSchema = BasePathContentSchema.extend({
  __typename: z.literal('PathContentDir'),
})

export const PathContentsResultSchema = z.discriminatedUnion('__typename', [
  PathContentFileSchema,
  PathContentDirSchema,
])

export const PathContentEdgeSchema = z.object({
  node: PathContentsResultSchema,
})

export const PathContentConnectionSchema = z.object({
  __typename: z.literal('PathContentConnection'),
  edges: z.array(PathContentEdgeSchema),
  pageInfo: z.object({
    hasNextPage: z.boolean(),
    endCursor: z.string().nullable(),
  }),
})

export const UnknownPathSchema = z.object({
  __typename: z.literal('UnknownPath'),
  message: z.string().nullish(),
})

export const MissingCoverageSchema = z.object({
  __typename: z.literal('MissingCoverage'),
  message: z.string().nullish(),
})

export const MissingHeadReportSchema = z.object({
  __typename: z.literal('MissingHeadReport'),
  message: z.string().nullish(),
})

export const PathContentsUnionSchema = z.discriminatedUnion('__typename', [
  PathContentConnectionSchema,
  UnknownPathSchema,
  MissingCoverageSchema,
  MissingHeadReportSchema,
  UnknownFlagsSchema,
])

export const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  repositoryConfig: RepositoryConfigSchema,
  branch: z
    .object({
      head: z
        .object({
          deprecatedPathContents: PathContentsUnionSchema.nullish(),
        })
        .nullable(),
    })
    .nullable(),
})

export type PathContentsSchemaType = z.infer<typeof PathContentsResultSchema>
export type PathContentResultType = z.infer<typeof PathContentsResultSchema>
