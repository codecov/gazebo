import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo/schemas'
import Api from 'shared/api'
import { type NetworkErrorObject } from 'shared/api/helpers'
import A from 'ui/A'

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
        const parsedData = BackfillComponentsMembershipSchema.safeParse(
          res?.data
        )

        if (!parsedData.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useComponentsBackfilled - 404 failed to parse',
          } satisfies NetworkErrorObject)
        }

        const data = parsedData.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return Promise.reject({
            status: 404,
            data: {},
            dev: `useComponentsBackfilled - 404 NotFoundError`,
          } satisfies NetworkErrorObject)
        }

        if (data?.owner?.repository?.__typename === 'OwnerNotActivatedError') {
          return Promise.reject({
            status: 403,
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
            dev: `useComponentsBackfilled - 403 OwnerNotActivatedError`,
          } satisfies NetworkErrorObject)
        }

        return {
          ...data?.config,
          ...data?.owner?.repository,
        }
      }),
  })
}
