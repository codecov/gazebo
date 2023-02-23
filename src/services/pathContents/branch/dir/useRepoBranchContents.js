import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

import { query } from './constants'

function fetchRepoContents({
  provider,
  owner,
  repo,
  branch,
  path,
  filters,
  signal,
}) {
  return Api.graphql({
    provider,
    query,
    signal,
    variables: {
      name: owner,
      repo,
      branch,
      path,
      filters,
    },
  }).then((res) => ({
    results: res?.data?.owner?.repository?.branch?.head?.pathContents?.results,
    indicationRange:
      res?.data?.owner?.repository?.repositoryConfig?.indicationRange,
  }))
}

export function useRepoBranchContents({
  provider,
  owner,
  repo,
  branch,
  path,
  filters,
  ...options
}) {
  return useQuery({
    queryKey: [
      'BranchContents',
      provider,
      owner,
      repo,
      branch,
      path,
      filters,
      query,
    ],
    queryFn: ({ signal }) =>
      fetchRepoContents({
        provider,
        owner,
        repo,
        branch,
        path,
        filters,
        signal,
      }),
    ...options,
  })
}
