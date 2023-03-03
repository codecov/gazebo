import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

import { query } from './constants'

export const useRepoCommitContents = ({
  provider,
  owner,
  repo,
  commit,
  path,
  filters,
  opts = {},
}) => {
  return useQuery({
    queryKey: [
      'CommitPathContents',
      provider,
      owner,
      repo,
      commit,
      path,
      filters,
      query,
    ],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          name: owner,
          repo,
          commit,
          path,
          filters,
        },
      }).then((res) => ({
        results: res?.data?.owner?.repository?.commit?.pathContents?.results,
        indicationRange:
          res?.data?.owner?.repository?.repositoryConfig?.indicationRange,
      })),
    ...opts,
  })
}
