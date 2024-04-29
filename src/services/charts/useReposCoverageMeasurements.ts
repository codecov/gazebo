import { useQuery } from '@tanstack/react-query'
import type { UseQueryOptions } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'

export const ReposCoverageMeasurementsConfig = z
  .object({
    measurements: z.array(
      z.object({
        timestamp: z.string(),
        avg: z.number().nullish(),
      })
    ),
  })
  .nullish()

type ReposCoverageMeasurementsData =
  | z.infer<typeof ReposCoverageMeasurementsConfig>
  | {}

export interface UseReposCoverageMeasurementsArgs {
  provider: string
  owner: string
  interval: 'INTERVAL_30_DAY' | 'INTERVAL_7_DAY' | 'INTERVAL_1_DAY'
  before?: string
  after?: string
  repos?: string[]
  opts?: UseQueryOptions<ReposCoverageMeasurementsData>
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
      }).then(
        (res) => ReposCoverageMeasurementsConfig.parse(res?.data?.owner) ?? {}
      ),
    ...(!!opts && opts),
  })
}
