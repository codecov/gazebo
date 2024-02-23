import { useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'

import { query } from './constants'

export function usePrefetchBranchDirEntry({ branch, path, filters }) {
  const { provider, owner, repo } = useParams()
  const queryClient = useQueryClient()

  const runPrefetch = async () =>
    await queryClient.prefetchQuery({
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
      queryFn: () =>
        Api.graphql({
          provider,
          repo,
          query,
          variables: {
            name: owner,
            repo,
            branch,
            path,
            filters,
          },
        }).then((res) => {
          let results
          if (
            res?.data?.owner?.repository?.branch?.head?.__typename ===
            'PathContents'
          ) {
            results =
              res?.data?.owner?.repository?.branch?.head?.pathContents?.results
          }
          return {
            results: results ?? null,
            indicationRange:
              res?.data?.owner?.repository?.repositoryConfig?.indicationRange,
            __typename: res?.data?.owner?.repository?.branch?.head?.__typename,
          }
        }),
      staleTime: 10000,
    })

  return { runPrefetch }
}
