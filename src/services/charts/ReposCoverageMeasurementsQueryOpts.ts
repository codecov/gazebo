import { queryOptions as queryOptionsV5 } from '@tanstack/react-queryV5'
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

const query = `query GetReposCoverageMeasurements(
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
}`

export interface ReposCoverageMeasurementsQueryArgs {
  provider: string
  owner: string
  interval: 'INTERVAL_30_DAY' | 'INTERVAL_7_DAY' | 'INTERVAL_1_DAY'
  before?: string | Date
  after?: string | Date
  repos?: string[]
  isPublic?: boolean // by default, get both public and private repos
}

export const ReposCoverageMeasurementsQueryOpts = ({
  provider,
  owner,
  interval,
  before,
  after,
  repos,
  isPublic, // by default, get both public and private repos
}: ReposCoverageMeasurementsQueryArgs) => {
  return queryOptionsV5({
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
            dev: 'ReposCoverageMeasurementsQueryOpts - 404 schema parsing failed',
            error: parsedData.error,
          })
        }

        return {
          measurements: parsedData.data?.owner?.measurements ?? [],
        }
      }),
  })
}
