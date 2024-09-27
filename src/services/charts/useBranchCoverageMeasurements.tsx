import { QueryOptions, useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo'
import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'
import A from 'ui/A'

const MEASUREMENT_INTERVALS = {
  INTERVAL_1_DAY: 'INTERVAL_1_DAY',
  INTERVAL_7_DAY: 'INTERVAL_7_DAY',
  INTERVAL_30_DAY: 'INTERVAL_30_DAY',
} as const

type MeasurementIntervals = keyof typeof MEASUREMENT_INTERVALS

const MeasurementsSchema = z.object({
  measurements: z.array(
    z.object({
      timestamp: z.string(),
      max: z.number().nullable(),
    })
  ),
})

type Measurements = z.infer<typeof MeasurementsSchema>

const GetBranchCoverageMeasurementsSchema = z.object({
  owner: z
    .object({
      repository: z
        .discriminatedUnion('__typename', [
          z.object({
            __typename: z.literal('Repository'),
            coverageAnalytics: MeasurementsSchema.optional(),
          }),
          RepoNotFoundErrorSchema,
          RepoOwnerNotActivatedErrorSchema,
        ])
        .nullable(),
    })
    .nullable(),
})

const query = `
query GetBranchCoverageMeasurements(
  $owner: String!
  $repo: String!
  $branch: String
  $after: DateTime
  $before: DateTime
  $interval: MeasurementInterval!
) {
  owner(username: $owner) {
    repository: repository(name: $repo) {
      __typename
      ... on Repository {
        coverageAnalytics{
          measurements(
            interval: $interval
            after: $after
            before: $before
            branch: $branch
          ) {
            timestamp
            max
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

interface UseBranchCoverageMeasurementsArgs {
  provider: string
  owner: string
  repo: string
  interval: MeasurementIntervals
  before: Date
  after: Date
  branch: string
  opts?: QueryOptions<Measurements>
}

export const useBranchCoverageMeasurements = ({
  provider,
  owner,
  repo,
  interval,
  before,
  after,
  branch,
  opts = {},
}: UseBranchCoverageMeasurementsArgs) =>
  useQuery({
    queryKey: [
      'GetBranchCoverageMeasurements',
      provider,
      owner,
      repo,
      interval,
      before,
      after,
      branch,
      query,
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
          interval,
          before,
          after,
          branch,
        },
      }).then((res) => {
        const parsedData = GetBranchCoverageMeasurementsSchema.safeParse(
          res?.data
        )

        if (!parsedData.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useBranchCoverageMeasurements - 404 Failed to parse data',
          } satisfies NetworkErrorObject)
        }

        const data = parsedData.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useBranchCoverageMeasurements - 404 Not found error',
          } satisfies NetworkErrorObject)
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
            dev: 'useBranchCoverageMeasurements - 403 Owner not activated',
          } satisfies NetworkErrorObject)
        }

        return {
          measurements:
            data?.owner?.repository?.coverageAnalytics?.measurements ?? [],
        }
      }),
    ...opts,
  })
