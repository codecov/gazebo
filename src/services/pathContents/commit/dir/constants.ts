import { z } from 'zod'

import { MissingHeadReportSchema } from 'services/comparison'
import { UnknownFlagsSchema } from 'services/impactedFiles/schemas'
import {
  MissingCoverageSchema,
  PathContentConnectionSchema,
  UnknownPathSchema,
} from 'services/pathContents/branch/dir'
import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo'

const RepositoryConfigSchema = z.object({
  indicationRange: z
    .object({
      upperRange: z.number(),
      lowerRange: z.number(),
    })
    .nullable(),
})

const PathContentsUnionSchema = z.discriminatedUnion('__typename', [
  PathContentConnectionSchema,
  UnknownPathSchema,
  MissingCoverageSchema,
  MissingHeadReportSchema,
  UnknownFlagsSchema,
])

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  repositoryConfig: RepositoryConfigSchema.nullish(),
  commit: z.object({
    pathContents: PathContentsUnionSchema.nullish(),
  }),
})

export const RequestSchema = z.object({
  owner: z
    .object({
      repository: z.discriminatedUnion('__typename', [
        RepositorySchema,
        RepoNotFoundErrorSchema,
        RepoOwnerNotActivatedErrorSchema,
      ]),
    })
    .nullable(),
})

export const query = `
  query CommitPathContents(
    $name: String!
    $commit: String!
    $repo: String!
    $path: String!
    $filters: PathContentsFilters!
  ) {
    owner(username: $name) {
      repository(name: $repo) {
        __typename
        ... on Repository {
          repositoryConfig {
            indicationRange {
              upperRange
              lowerRange
            }
          }
          commit(id: $commit) {
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
                  ... on PathContentFile {
                    isCriticalFile
                  }
                }
                __typename
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
