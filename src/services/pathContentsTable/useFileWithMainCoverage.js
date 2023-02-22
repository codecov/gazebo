import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

// This query needs to be common between this hook and hooks that use prefetch
import { queryForCommitFile as query } from './constants'
import { extractCoverageFromResponse } from './utils'

// There's only 1 hook per page table as of Feb 22, 2023. This is a limitation to tailor a table to a particular page. Each "page" should have an independent set of hooks for directory and file entries. Every usePrefetchFile<page name> hook needs to this hook's query and queryKey
export function useFileWithMainCoverage({ provider, owner, repo, ref, path }) {
  return useQuery({
    queryKey: [
      'commit',
      provider,
      owner,
      repo,
      ref,
      path,
      query,
      extractCoverageFromResponse,
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
          ref,
          path,
        },
      }).then(extractCoverageFromResponse),
  })
}
