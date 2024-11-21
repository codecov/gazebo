import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/helpers'

const ReposCoverageMeasurementsConfig = z.array(
  z.object({
    timestamp: z.string(),
    avg: z.number().nullable(),
  })
)

const RequestSchema = z.object({
  owner: z
    .object({
      measurements: ReposCoverageMeasurementsConfig.nullable(),
    })
    .nullable(),
})

export interface UseReposCoverageMeasurementsArgs {
  provider: string
  owner: string
  interval: 'INTERVAL_30_DAY' | 'INTERVAL_7_DAY' | 'INTERVAL_1_DAY'
  before?: string | Date
  after?: string | Date
  repos?: string[]
  opts?: {
    suspense?: boolean
    keepPreviousData?: boolean
    staleTime?: number
  }
  isPublic?: boolean // by default, get both public and private repos
}

const query = `
  query GetReposCoverageMeasurements(
    $owner: String!
    $before: DateTime
    $after: DateTime
    $interval: MeasurementInterval!
    $repos: [String!]
    $isPublic: Boolean
  ) {
    owner(username: $owner) {
      measurements(
        after: $after
        before: $before
        interval: $interval
        repos: $repos
        isPublic: $isPublic
      ) {
        timestamp
        avg
      }
    }
  }
`

export const useReposCoverageMeasurements = ({
  provider,
  owner,
  interval,
  before,
  after,
  repos,
  opts,
  isPublic, // by default, get both public and private repos
}: UseReposCoverageMeasurementsArgs) => {
  return useQuery({
    queryKey: [
      'GetReposCoverageMeasurements',
      provider,
      query,
      owner,
      interval,
      before,
      after,
      repos,
      isPublic,
    ],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
          interval,
          before,
          after,
          repos,
          isPublic,
        },
      }).then((res) => {
        const parsedData = RequestSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'useReposCoverageMeasurements - 404 schema parsing failed',
            error: parsedData.error,
          })
        }

        return {
          measurements: parsedData.data?.owner?.measurements ?? null,
        }
      }),
    ...(opts ? opts : {}),
  })
}
