import { queryOptions as queryOptionsV5 } from '@tanstack/react-queryV5'
import { z } from 'zod'

import { RepoNotFoundErrorSchema } from 'services/repo/schemas/RepoNotFoundError'
import { RepoOwnerNotActivatedErrorSchema } from 'services/repo/schemas/RepoOwnerNotActivatedError'
import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'
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
            errorName: 'Parsing Error',
            errorDetails: {
              callingFn: 'BranchCoverageMeasurementsQueryOpts',
              error: parsedData.error,
            },
          })
        }

        const data = parsedData.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return rejectNetworkError({
            errorName: 'Not Found Error',
            errorDetails: { callingFn: 'BranchCoverageMeasurementsQueryOpts' },
          })
        }

        if (data?.owner?.repository?.__typename === 'OwnerNotActivatedError') {
          return rejectNetworkError({
            errorName: 'Owner Not Activated',
            errorDetails: { callingFn: 'BranchCoverageMeasurementsQueryOpts' },
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
          })
        }

        return {
          measurements:
            data?.owner?.repository?.coverageAnalytics?.measurements ?? [],
        }
      }),
  })
