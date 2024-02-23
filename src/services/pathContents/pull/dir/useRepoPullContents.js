import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

import { query } from './constants'

// The queryKey needs to be the same bw this and it's prefetch hook
export const useRepoPullContents = ({
  provider,
  owner,
  repo,
  pullId,
  path,
  filters,
  opts = {},
}) => {
  return useQuery({
    queryKey: [
      'PullPathContents',
      provider,
      owner,
      repo,
      pullId,
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
          owner,
          repo,
          pullId: parseInt(pullId, 10),
          path,
          filters,
        },
      }).then((res) => {
        let results
        if (
          res?.data?.owner?.repository?.pull?.head?.pathContents?.__typename ===
          'PathContents'
        ) {
          results =
            res?.data?.owner?.repository?.pull?.head?.pathContents?.results
        }

        return {
          results: results ?? null,
          commitid: res?.data?.owner?.repository?.pull?.head?.commitid,
          indicationRange:
            res?.data?.owner?.repository?.repositoryConfig?.indicationRange,
        }
      }),
    ...opts,
  })
}
