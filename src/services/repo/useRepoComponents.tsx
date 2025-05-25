import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import z from 'zod'

import { OrderingDirection } from 'types'

import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'
import A from 'ui/A'

import { RepoNotFoundErrorSchema } from './schemas/RepoNotFoundError'
import { RepoOwnerNotActivatedErrorSchema } from './schemas/RepoOwnerNotActivatedError'

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
        coverageAnalytics {
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
  coverageAnalytics: z
    .object({
      components: z.array(ComponentEdgeSchema),
    })
    .nullable(),
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
    queryFn: ({ signal }) => {
      return Api.graphql({
        provider,
        query,
        signal,
        variables: {
          name: owner,
          repo,
          filters,
          orderingDirection,
          interval,
          after,
          before,
          branch,
        },
      }).then((res) => {
        const callingFn = 'useRepoComponents'
        const parsedRes = RequestSchema.safeParse(res?.data)

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

        // This returns something else 2
        return {
          components: data?.owner?.repository?.coverageAnalytics?.components,
        }
      })
    },
    ...opts,
  })
}
