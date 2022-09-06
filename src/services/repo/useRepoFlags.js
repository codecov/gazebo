import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom/cjs/react-router-dom.min'

import Api from 'shared/api'

import { mapEdges } from '../../shared/utils/graphql'

function fetchRepoFlags({
  provider,
  owner: name,
  repo,
  filters,
  orderingDirection,
  interval,
  afterDate,
  beforeDate,
  after,
}) {
  const query = `
    query FlagMeasurements(
      $name: String!
      $repo: String!
      $filters: FlagSetFilters!
      $orderingDirection: OrderingDirection!
      $interval: MeasurementInterval!
      $afterDate: DateTime!
      $beforeDate: DateTime!
      $after: String
    ) {
      owner(username: $name) {
        repository(name: $repo) {
          flags(filters: $filters, orderingDirection: $orderingDirection, after: $after, first: 15) {
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                name
                percentCovered
                percentChange
                measurements(interval: $interval, after: $afterDate, before: $beforeDate) {
                  avg
                }
              }
            }
          }
        }
      }
    }
   `
  return Api.graphql({
    provider,
    query,
    variables: {
      name,
      repo,
      filters,
      orderingDirection,
      interval,
      afterDate,
      beforeDate,
      after,
    },
  }).then((res) => {
    const { flags } = res?.data?.owner?.repository

    return {
      flags: mapEdges(flags),
      pageInfo: flags?.pageInfo,
    }
  })
}

export function useRepoFlags({
  filters,
  orderingDirection,
  interval,
  afterDate,
  beforeDate,
  ...options
}) {
  const { provider, owner, repo } = useParams()

  const { data, ...rest } = useInfiniteQuery(
    [
      'RepoFlags',
      provider,
      owner,
      repo,
      filters,
      orderingDirection,
      interval,
      afterDate,
      beforeDate,
    ],
    ({ pageParam: after }) =>
      fetchRepoFlags({
        provider,
        owner,
        repo,
        filters,
        orderingDirection,
        interval,
        afterDate,
        beforeDate,
        after,
      }),
    {
      getNextPageParam: (data) =>
        data?.pageInfo?.hasNextPage ? data.pageInfo.endCursor : undefined,
      ...options,
    }
  )
  return {
    data: data?.pages.map((page) => page?.flags).flat(),
    ...rest,
  }
}

function fetchRepoFlagsTotalCount({ provider, owner: name, repo }) {
  const query = `
    query RepoFlagsTotalCount(
      $name: String!
      $repo: String!
      $filters: FlagSetFilters!
      $after: String
    ) {
      owner(username: $name) {
        repository(name: $repo) {
          flags(filters: $filters, after: $after) {
            totalCount
          }
        }
      }
    }
   `
  return Api.graphql({
    provider,
    query,
    variables: {
      name,
      repo,
      filters: {},
    },
  })
}

export function useRepoFlagsTotalCount() {
  const { provider, owner, repo } = useParams()
  return useQuery(
    ['RepoFlagsTotalCount', provider, owner, repo],
    () =>
      fetchRepoFlagsTotalCount({
        provider,
        owner,
        repo,
      }),
    {
      select: ({ data }) => data?.owner?.repository?.flags?.totalCount,
    }
  )
}
