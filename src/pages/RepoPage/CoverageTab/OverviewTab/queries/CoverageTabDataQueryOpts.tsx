import { queryOptions as queryOptionsV5 } from '@tanstack/react-queryV5'
import { z } from 'zod'

import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo'
import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/helpers'
import A from 'ui/A'

const BranchSchema = z
  .object({
    head: z
      .object({
        coverageAnalytics: z
          .object({
            totals: z
              .object({
                fileCount: z.number().nullable(),
              })
              .nullable(),
          })
          .nullable(),
      })
      .nullable(),
  })
  .nullable()

const GetBranchSchema = z.object({
  owner: z
    .object({
      repository: z
        .discriminatedUnion('__typename', [
          z.object({
            __typename: z.literal('Repository'),
            branch: BranchSchema,
          }),
          RepoNotFoundErrorSchema,
          RepoOwnerNotActivatedErrorSchema,
        ])
        .nullable(),
    })
    .nullable(),
})

const query = `
query CoverageTabData($owner: String!, $repo: String!, $branch: String!) {
  owner(username: $owner) {
    repository(name: $repo) {
      __typename
      ... on Repository {
        branch(name: $branch) {
          head {
            coverageAnalytics {
              totals {
                fileCount
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
}`

interface CoverageTabDataQueryArgs {
  provider: string
  owner: string
  repo: string
  branch: string
}

export const CoverageTabDataQueryOpts = ({
  provider,
  owner,
  repo,
  branch,
}: CoverageTabDataQueryArgs) => {
  return queryOptionsV5({
    queryKey: ['CoverageTabData', provider, owner, repo, branch],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
          repo,
          branch,
        },
      }).then((res) => {
        const parsedData = GetBranchSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'useCoverageTabData - 404 schema parsing failed',
            error: parsedData.error,
          })
        }

        const data = parsedData.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'useCoverageTabData - 404 NotFoundError',
          })
        }

        if (data?.owner?.repository?.__typename === 'OwnerNotActivatedError') {
          return rejectNetworkError({
            status: 403,
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
            dev: 'useCoverageTabData - 403 OwnerNotActivatedError',
          })
        }

        return {
          branch: data?.owner?.repository?.branch ?? null,
        }
      }),
  })
}