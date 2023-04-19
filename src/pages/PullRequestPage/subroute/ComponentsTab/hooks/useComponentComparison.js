import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'

import { query } from './query'

export function useComponentComparison({ opts = {} }) {
  const { owner, repo, pullId, provider } = useParams()
  return useQuery({
    queryKey: ['PullComponentComparison', provider, owner, repo, pullId, query],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          provider,
          owner,
          repo,
          pullId: parseInt(pullId, 10),
        },
      }),
    ...opts,
  })
}
