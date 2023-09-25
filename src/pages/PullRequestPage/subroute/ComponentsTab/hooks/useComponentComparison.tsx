import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import {
  FirstPullRequestSchema,
  MissingBaseCommitSchema,
  MissingBaseReportSchema,
  MissingComparisonSchema,
  MissingHeadCommitSchema,
  MissingHeadReportSchema,
} from 'services/comparison'
import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo'
import Api from 'shared/api'
import A from 'ui/A'

import { query } from './query'

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  pull: z
    .object({
      compareWithBase: z.discriminatedUnion('__typename', [
        z.object({
          __typename: z.literal('Comparison'),
          componentComparisons: z
            .array(
              z.object({
                name: z.string(),
                patchTotals: z
                  .object({
                    percentCovered: z.number().nullable(),
                  })
                  .nullable(),
                headTotals: z
                  .object({ percentCovered: z.number().nullable() })
                  .nullable(),
                baseTotals: z
                  .object({ percentCovered: z.number().nullable() })
                  .nullable(),
              })
            )
            .nullable(),
        }),
        FirstPullRequestSchema,
        MissingBaseCommitSchema,
        MissingBaseReportSchema,
        MissingComparisonSchema,
        MissingHeadCommitSchema,
        MissingHeadReportSchema,
      ]),
    })
    .nullable(),
})

const ComponentComparisonSchema = z.object({
  owner: z
    .object({
      repository: z
        .discriminatedUnion('__typename', [
          RepositorySchema,
          RepoNotFoundErrorSchema,
          RepoOwnerNotActivatedErrorSchema,
        ])
        .nullable(),
    })
    .nullable(),
})

interface URLParams {
  provider: string
  owner: string
  repo: string
  pullId: string
}

export function useComponentComparison() {
  const { provider, owner, repo, pullId } = useParams<URLParams>()
  return useQuery({
    queryKey: ['PullComponentComparison', provider, owner, repo, pullId, query],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          provider,
          owner,
          repo,
          pullId: parseInt(pullId, 10),
        },
      }).then((res) => {
        const parsedData = ComponentComparisonSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return Promise.reject({
            status: 404,
            data: {},
          })
        }

        const data = parsedData.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return Promise.reject({
            status: 404,
            data: {},
          })
        }

        if (data?.owner?.repository?.__typename === 'OwnerNotActivatedError') {
          return Promise.reject({
            status: 403,
            data: {
              detail: (
                <p>
                  Activation is required to view this repo, please{' '}
                  {/* @ts-expect-error */}
                  <A to={{ pageName: 'membersTab' }}>click here </A> to activate
                  your account.
                </p>
              ),
            },
          })
        }

        return {
          pull: data?.owner?.repository?.pull,
        }
      }),
  })
}
