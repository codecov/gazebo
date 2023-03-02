import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

const query = `
  query GetBranchCoverageMeasurements(
    $owner: String!
    $repo: String!
    $branch: String
    $after: DateTime!
    $before: DateTime!
    $interval: MeasurementInterval!
  ) {
    owner(username: $owner) {
      repository(name: $repo) {
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
  }`

export const useBranchCoverageMeasurements = ({
  provider,
  owner,
  repo,
  interval,
  before,
  after,
  branch,
  opts = {},
}) =>
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
      }).then((res) => res?.data?.owner?.repository),
    ...opts,
  })
