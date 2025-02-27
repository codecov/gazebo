import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'
import A from 'ui/A'

import { RepoNotFoundErrorSchema } from './schemas/RepoNotFoundError'
import { RepoOwnerNotActivatedErrorSchema } from './schemas/RepoOwnerNotActivatedError'

const query = `
query BackfillComponentMemberships($name: String!, $repo: String!) {
  config {
    isTimescaleEnabled
  }
  owner(username: $name) {
    repository(name: $repo) {
      __typename
      ... on Repository {
        coverageAnalytics {
          componentsMeasurementsActive
          componentsMeasurementsBackfilled
          componentsCount
        }
      }
    }
  }
}
`
const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  coverageAnalytics: z
    .object({
      componentsMeasurementsActive: z.boolean().nullish(),
      componentsMeasurementsBackfilled: z.boolean().nullish(),
      componentsCount: z.number().nullish(),
    })
    .nullable(),
})

const BackfillComponentsMembershipSchema = z.object({
  config: z
    .object({
      isTimescaleEnabled: z.boolean().nullish(),
    })
    .nullish(),
  owner: z.object({
    repository: z.discriminatedUnion('__typename', [
      RepositorySchema,
      RepoNotFoundErrorSchema,
      RepoOwnerNotActivatedErrorSchema,
    ]),
  }),
})

interface URLParams {
  provider: string
  owner: string
  repo: string
}

export function useComponentsBackfilled() {
  const { provider, owner, repo } = useParams<URLParams>()
  return useQuery({
    queryKey: ['BackfillComponentMemberships', provider, owner, repo],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          name: owner,
          repo,
        },
      }).then((res) => {
        const callingFn = 'useComponentsBackfilled'
        const parsedData = BackfillComponentsMembershipSchema.safeParse(
          res?.data
        )

        if (!parsedData.success) {
          return rejectNetworkError({
            errorName: 'Parsing Error',
            errorDetails: { callingFn, error: parsedData.error },
          })
        }

        const data = parsedData.data

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
                  <A
                    to={{ pageName: 'membersTab' }}
                    hook="activate-members"
                    isExternal={false}
                  >
                    click here{' '}
                  </A>{' '}
                  to activate your account.
                </p>
              ),
            },
          })
        }

        return {
          ...data?.config,
          ...data?.owner?.repository?.coverageAnalytics,
        }
      }),
  })
}
