import { queryOptions as queryOptionsV5 } from '@tanstack/react-queryV5'
import { z } from 'zod'

import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo'
import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/helpers'
import A from 'ui/A'

type MeasurementIntervals =
  | 'INTERVAL_1_DAY'
  | 'INTERVAL_7_DAY'
  | 'INTERVAL_30_DAY'

const MeasurementsSchema = z.object({
  measurements: z.array(
    z.object({
      timestamp: z.string(),
      max: z.number().nullable(),
    })
  ),
})

const GetBranchCoverageMeasurementsSchema = z.object({
  owner: z
    .object({
      repository: z
        .discriminatedUnion('__typename', [
          z.object({
            __typename: z.literal('Repository'),
            coverageAnalytics: MeasurementsSchema.nullable(),
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

interface BranchCoverageMeasurementsQueryArgs {
  provider: string
  owner: string
  repo: string
  interval: MeasurementIntervals
  before: Date | null
  after: Date | null
  branch: string
}

export const BranchCoverageMeasurementsQueryOpts = ({
  provider,
  owner,
  repo,
  interval,
  before,
  after,
  branch,
}: BranchCoverageMeasurementsQueryArgs) =>
  queryOptionsV5({
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
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'BranchCoverageMeasurementsQueryOpts - 404 Failed to parse data',
            error: parsedData.error,
          })
        }

        const data = parsedData.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'BranchCoverageMeasurementsQueryOpts - 404 Not found error',
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
            dev: 'BranchCoverageMeasurementsQueryOpts - 403 Owner not activated',
          })
        }

        return {
          measurements:
            data?.owner?.repository?.coverageAnalytics?.measurements ?? [],
        }
      }),
  })
