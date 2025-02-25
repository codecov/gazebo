import { z } from 'zod'

import { MissingHeadReportSchema } from 'services/comparison/schemas/MissingHeadReport'
import { UnknownFlagsSchema } from 'services/impactedFiles/schemas/UnknownFlags'

const MissingCoverageSchema = z.object({
  __typename: z.literal('MissingCoverage'),
  message: z.string(),
})

const UnknownPathSchema = z.object({
  __typename: z.literal('UnknownPath'),
  message: z.string(),
})

const RepositoryConfigSchema = z.object({
  indicationRange: z
    .object({
      upperRange: z.number(),
      lowerRange: z.number(),
    })
    .nullable(),
})

const PathContentFileSchema = z.object({
  __typename: z.literal('PathContentFile'),
  name: z.string(),
  path: z.string(),
  hits: z.number(),
  misses: z.number(),
  partials: z.number(),
  lines: z.number(),
  percentCovered: z.number(),
})

export type PathContentFile = z.infer<typeof PathContentFileSchema>

const PathContentDirSchema = z.object({
  __typename: z.literal('PathContentDir'),
  name: z.string(),
  path: z.string(),
  hits: z.number(),
  misses: z.number(),
  partials: z.number(),
  lines: z.number(),
  percentCovered: z.number(),
})

export type PathContentDir = z.infer<typeof PathContentDirSchema>

const PathContentsSchema = z.object({
  __typename: z.literal('PathContents'),
  results: z.array(
    z.discriminatedUnion('__typename', [
      PathContentFileSchema,
      PathContentDirSchema,
    ])
  ),
})

const PullSchema = z.object({
  head: z
    .object({
      commitid: z.string(),
      pathContents: z
        .discriminatedUnion('__typename', [
          PathContentsSchema,
          MissingCoverageSchema,
          UnknownPathSchema,
          MissingHeadReportSchema,
          UnknownFlagsSchema,
        ])
        .nullable(),
    })
    .nullable(),
})

export const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  repositoryConfig: RepositoryConfigSchema.nullable(),
  pull: PullSchema.nullable(),
})

export const query = `
  query PullPathContents(
    $owner: String!,
    $repo: String!,
    $pullId: Int!
    $path: String!
    $filters: PathContentsFilters!
  ) {
    owner(username: $owner) {
      repository(name: $repo) {
        __typename
        ... on Repository {
          repositoryConfig {
            indicationRange {
              upperRange
              lowerRange
            }
          }
          pull(id: $pullId) {
            head {
              commitid
              pathContents(path: $path, filters: $filters) {
                __typename
                ... on PathContents {
                  results {
                    __typename
                    hits
                    misses
                    partials
                    lines
                    name
                    path
                    percentCovered
                  }
                }
                ... on UnknownPath {
                  message
                }
                ... on MissingCoverage {
                  message
                }
                ... on MissingHeadReport {
                  message
                }
                ... on UnknownFlags {
                  message
                }
              }
            }
          }
        }
        ... on NotFoundError {
          message
        }
        ... on OwnerNotActivatedError {
          message
        }
      }
    }
  }
`
