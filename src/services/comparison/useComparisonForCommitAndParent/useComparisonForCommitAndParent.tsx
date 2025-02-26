import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo'
import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'
import A from 'ui/A'

import { query } from './query'

import { FirstPullRequestSchema } from '../schemas/FirstPullRequest'
import { MissingBaseCommitSchema } from '../schemas/MissingBaseCommit'
import { MissingBaseReportSchema } from '../schemas/MissingBaseReport'
import { MissingComparisonSchema } from '../schemas/MissingComparison'
import { MissingHeadCommitSchema } from '../schemas/MissingHeadCommit'
import { MissingHeadReportSchema } from '../schemas/MissingHeadReport'

const CoverageObjSchema = z.object({
  coverage: z.number().nullish(),
})

export const ImpactedFileSchema = z.object({
  headName: z.string().nullable(),
  hashedPath: z.string(),
  isNewFile: z.boolean(),
  isRenamedFile: z.boolean(),
  isDeletedFile: z.boolean(),
  baseCoverage: CoverageObjSchema.nullable(),
  headCoverage: CoverageObjSchema.nullable(),
  patchCoverage: CoverageObjSchema.nullable(),
  changeCoverage: z.number().nullable(),
  segments: z.object({
    results: z.array(
      z.object({
        header: z.string(),
        hasUnintendedChanges: z.boolean(),
        lines: z.array(
          z.object({
            baseNumber: z.string().nullable(),
            headNumber: z.string().nullable(),
            baseCoverage: z.string().nullable(),
            headCoverage: z.string().nullable(),
            content: z.string().nullable(),
            coverageInfo: z.object({
              hitCount: z.number().nullable(),
              hitUploadIds: z.array(z.number()).nullable(),
            }),
          })
        ),
      })
    ),
  }),
})

export type ImpactedFileType = z.infer<typeof ImpactedFileSchema>

const ComparisonSchema = z.object({
  __typename: z.literal('Comparison'),
  impactedFile: ImpactedFileSchema.nullable(),
})

const CompareWithParentSchema = z
  .discriminatedUnion('__typename', [
    ComparisonSchema,
    FirstPullRequestSchema,
    MissingBaseCommitSchema,
    MissingBaseReportSchema,
    MissingComparisonSchema,
    MissingHeadCommitSchema,
    MissingHeadReportSchema,
  ])
  .nullable()

export const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  commit: z
    .object({
      compareWithParent: CompareWithParentSchema.nullable(),
    })
    .nullable(),
})

export const ComparisonForCommitAndParentSchema = z.object({
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

interface UseComparisonForCommitAndParentArgs {
  provider: string
  owner: string
  repo: string
  commitid: string
  path: string
  filters?: {
    hasUnintendedChanges?: boolean
  }
  opts?: {
    enabled?: boolean
  }
}

// TODO: make the a similar hook for the comparison with base, useComparisonForHeadAndBase
export function useComparisonForCommitAndParent({
  provider,
  owner,
  repo,
  commitid,
  path,
  filters,
  opts = {},
}: UseComparisonForCommitAndParentArgs) {
  let enabled = true
  if (opts?.enabled !== undefined) {
    enabled = opts.enabled
  }

  return useQuery({
    queryKey: [
      'ImpactedFileComparedWithParent',
      provider,
      owner,
      repo,
      commitid,
      path,
      filters,
    ],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          provider,
          owner,
          repo,
          commitid,
          path,
          filters,
        },
      }).then((res) => {
        const callingFn = 'useComparisonForCommitAndParent'
        const parsedRes = ComparisonForCommitAndParentSchema.safeParse(
          res?.data
        )

        if (!parsedRes.success) {
          return rejectNetworkError({
            errorName: 'Parsing Error',
            errorDetails: { callingFn, error: parsedRes.error },
          })
        }

        const data = parsedRes.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return rejectNetworkError({
            errorName: 'Not Found Error',
            errorDetails: { callingFn },
          })
        }

        if (data?.owner?.repository?.__typename === 'OwnerNotActivatedError') {
          return rejectNetworkError({
            errorName: 'Owner Not Activated',
            errorDetails: { callingFn },
            data: {
              detail: (
                <p>
                  Activation is required to view this repo, please{' '}
                  {/* @ts-expect-error - A hasn't been typed yet */}
                  <A to={{ pageName: 'membersTab' }}>click here </A> to activate
                  your account.
                </p>
              ),
            },
          })
        }

        if (
          data?.owner?.repository?.commit?.compareWithParent?.__typename ===
          'Comparison'
        ) {
          return data?.owner?.repository?.commit?.compareWithParent
        }

        return null
      }),
    enabled,
  })
}
