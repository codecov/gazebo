import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import z from 'zod'

import { OrderingDirection } from 'types'

import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo/schemas'
import Api from 'shared/api'
import { type NetworkErrorObject } from 'shared/api/helpers'
import A from 'ui/A'

const query = `
query ComponentMeasurements(
  $name: String!
  $repo: String!
  $filters: ComponentMeasurementsSetFilters
  $orderingDirection: OrderingDirection!
  $interval: MeasurementInterval!
  $before: DateTime!
  $after: DateTime!
  $branch: String
) {
  owner(username: $name) {
    repository(name: $repo) {
      __typename
      ... on Repository {
        components(
          filters: $filters
          orderingDirection: $orderingDirection
          after: $after
          interval: $interval
          before: $before
          branch: $branch
        ) {
          componentId
          name
          percentCovered
          percentChange
          lastUploaded
          measurements {
            avg
          }
        }
      }
    }
  }
}
`

export const ComponentEdgeSchema = z.object({
  componentId: z.string(),
  name: z.string(),
  percentCovered: z.number().nullable(),
  percentChange: z.number().nullable(),
  lastUploaded: z.string().nullable(),
  measurements: z.array(
    z.object({
      avg: z.number().nullable(),
    })
  ),
})

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  components: z.array(ComponentEdgeSchema),
})

const RequestSchema = z.object({
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

interface FetchRepoComponentsArgs {
  provider: string
  owner: string
  repo: string
  filters?: {
    components?: string[]
  }
  branch?: string
  orderingDirection: OrderingDirection
  interval: 'INTERVAL_30_DAY' | 'INTERVAL_7_DAY' | 'INTERVAL_1_DAY'
  after: string
  before: string
  signal?: AbortSignal
}

function fetchRepoComponents({
  provider,
  owner: name,
  repo,
  filters,
  orderingDirection,
  interval,
  after,
  before,
  branch,
  signal,
}: FetchRepoComponentsArgs) {
  return Api.graphql({
    provider,
    query,
    signal,
    variables: {
      name,
      repo,
      filters,
      orderingDirection,
      interval,
      after,
      before,
      branch,
    },
  }).then((res) => {
    const parsedRes = RequestSchema.safeParse(res?.data)

    if (!parsedRes.success) {
      return Promise.reject({
        status: 404,
        data: {},
        dev: `useRepoComponents - 404 failed to parse`,
      } satisfies NetworkErrorObject)
    }

    const data = parsedRes.data

    if (data?.owner?.repository?.__typename === 'NotFoundError') {
      return Promise.reject({
        status: 404,
        data: {},
        dev: `useRepoComponents - 404 NotFoundError`,
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
        dev: `useRepoComponents - 403 OwnerNotActivatedError`,
      } satisfies NetworkErrorObject)
    }

    // This returns something else 2
    return {
      components: data?.owner?.repository?.components,
    }
  })
}

interface useRepoComponentsArgs {
  filters?: {
    components?: string[]
  }
  orderingDirection?: OrderingDirection
  interval: 'INTERVAL_30_DAY' | 'INTERVAL_7_DAY' | 'INTERVAL_1_DAY'
  after: string
  before: string
  branch?: string
  opts?: {
    suspense?: boolean
  }
}

export function useRepoComponents({
  filters = {},
  orderingDirection = 'DESC',
  interval,
  after,
  before,
  branch,
  opts = {},
}: useRepoComponentsArgs) {
  const { provider, owner, repo } = useParams<{
    provider: string
    owner: string
    repo: string
  }>()

  return useQuery({
    queryKey: [
      'ComponentMeasurements',
      provider,
      owner,
      repo,
      filters,
      orderingDirection,
      interval,
      after,
      before,
      branch,
    ],
    queryFn: ({ signal }) =>
      fetchRepoComponents({
        provider,
        owner,
        repo,
        filters: filters,
        orderingDirection,
        interval,
        after,
        before,
        branch,
        signal,
      }),
    ...opts,
  })
}
