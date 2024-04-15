import { ParsedQs } from 'qs'
import { z } from 'zod'

import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo'
import { DisplayType } from 'shared/ContentsTable/constants'

const pathContentsFiltersParam = [
  'NAME',
  'COVERAGE',
  'HITS',
  'MISSES',
  'PARTIALS',
  'LINES',
] as const

type PathContentsFiltersParam = (typeof pathContentsFiltersParam)[number]

export type PathContentsFilters = {
  searchValue?: string
  displayType?: DisplayType
  ordering?: {
    direction: 'ASC' | 'DESC'
    parameter: PathContentsFiltersParam
  }
  flags?: string[] | ParsedQs[]
  components?: string[] | ParsedQs[]
}

export function toPathContentsFilterParameter(
  parameter: string
): PathContentsFiltersParam {
  const uppercaseParam = parameter.toUpperCase()
  // This is the only way I could find to get TS to be okay with this.
  let match: PathContentsFiltersParam = 'NAME'
  pathContentsFiltersParam.forEach((param) => {
    if (uppercaseParam === param) {
      match = uppercaseParam
    }
  })
  return match
}

const CoverageSchema = z.array(
  z
    .object({
      line: z.number().nullish(),
      coverage: z
        .union([z.literal('H'), z.literal('M'), z.literal('P')])
        .nullish(),
    })
    .nullish()
)

const CoverageForFileSchema = z.object({
  commitid: z.string().nullish(),
  flagNames: z.array(z.string().nullish()).nullish(),
  coverageFile: z
    .object({
      hashedPath: z.string(),
      isCriticalFile: z.boolean().nullish(),
      content: z.string().nullish(),
      coverage: CoverageSchema.nullish(),
      totals: z
        .object({
          coverage: z.number().nullish(),
        })
        .nullish(),
    })
    .nullish(),
})

export const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  commit: CoverageForFileSchema.nullish(),
  branch: z
    .object({
      name: z.string(),
      head: CoverageForFileSchema.nullish(),
    })
    .nullish(),
})

export type PathContentsRepositorySchema = z.infer<typeof RepositorySchema>

export const PathContentsRequestSchema = z.object({
  owner: z
    .object({
      repository: z
        .discriminatedUnion('__typename', [
          RepositorySchema,
          RepoNotFoundErrorSchema,
          RepoOwnerNotActivatedErrorSchema,
        ])
        .nullish(),
    })
    .nullable(),
})

export const queryForCommitFile = `
query CoverageForFile(
  $owner: String!
  $repo: String!
  $ref: String!
  $path: String!
  $flags: [String]
) {
  owner(username: $owner) {
    repository(name: $repo) {
      ... on Repository {
        __typename
        commit(id: $ref) {
          ...CoverageForFile
        }
        branch(name: $ref) {
          name
          head {
            ...CoverageForFile
          }
        }
      }
      ... on NotFoundError {
        __typename
        message
      }
      ... on OwnerNotActivatedError {
        __typename
        message
      }
    }
  }
}

fragment CoverageForFile on Commit {
  commitid
  flagNames
  coverageFile(path: $path, flags: $flags) {
    hashedPath
    isCriticalFile
    content
    coverage {
      line
      coverage
    }
    totals {
      coverage: percentCovered # Absolute coverage of the commit
    }
  }
}`
