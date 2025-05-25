import { ParsedQs } from 'qs'
import { z } from 'zod'

import { OrderingDirection } from 'types'

import { RepoNotFoundErrorSchema } from 'services/repo/schemas/RepoNotFoundError'
import { RepoOwnerNotActivatedErrorSchema } from 'services/repo/schemas/RepoOwnerNotActivatedError'
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
    direction: OrderingDirection
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
  coverageAnalytics: z
    .object({
      flagNames: z.array(z.string().nullish()).nullish(),
      components: z.array(z.object({ id: z.string(), name: z.string() })),
      coverageFile: z
        .object({
          hashedPath: z.string(),
          content: z.string().nullish(),
          coverage: CoverageSchema.nullish(),
          totals: z
            .object({
              percentCovered: z.number().nullish(),
            })
            .nullish(),
        })
        .nullish(),
    })
    .nullable(),
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
  $components: [String]
) {
  owner(username: $owner) {
    repository(name: $repo) {
      __typename
      ... on Repository {
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
        message
      }
      ... on OwnerNotActivatedError {
        message
      }
    }
  }
}

fragment CoverageForFile on Commit {
  commitid
  coverageAnalytics {
    flagNames
    components {
      id
      name
    }
    coverageFile(path: $path, flags: $flags, components: $components) {
      hashedPath
      content
      coverage {
        line
        coverage
      }
      totals {
        percentCovered # Absolute coverage of the commit
      }
    }
  }
}`
