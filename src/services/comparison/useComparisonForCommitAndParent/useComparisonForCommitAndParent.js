import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

import { query } from './query'

// TODO: make the a similar hook for the comparison with base, useComparisonForHeadAndBase
export function useComparisonForCommitAndParent({
  provider,
  owner,
  repo,
  commitid,
  path,
  filters = {},
  opts = {},
}) {
  return useQuery({
    queryKey: [
      'ImpactedFileComparedWithParent',
      provider,
      owner,
      repo,
      commitid,
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
          provider,
          owner,
          repo,
          commitid,
          path,
          filters,
        },
      }),
    suspense: false,
    ...opts,
  })
}
