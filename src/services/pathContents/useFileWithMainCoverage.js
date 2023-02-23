import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

// This query needs to be common between this hook and hooks that use prefetch
import { queryForCommitFile as query } from './constants'
import { extractCoverageFromResponse } from './utils'

// There's only 1 hook per page table as of Feb 22, 2023. This is a limitation to tailor a table to a particular page. Each "page" should have an independent set of hooks for directory and file entries. Every usePrefetchFile<page name> hook needs to this hook's query and queryKey
// There should be a coverageForFile + prefetch hook set per page. This function, due to how it's written, acts as 1 hook all pages use, and each file implements it's prefetch function accordingly. This is something that needs to be changed, likely in a subsequent PR, as we're getting rid of the individual line file type layout anyway and doing diff line only
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
