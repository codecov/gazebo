import { useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import { extractCoverageFromResponse } from 'services/file/utils'
import Api from 'shared/api'

const query = `
query CoverageForFile(
  $owner: String!
  $repo: String!
  $ref: String!
  $path: String!
) {
  owner(username: $owner) {
    repository(name: $repo) {
      commit(id: $ref) {
        ...CoverageForFile
      }
      branch(name: $ref) {
        name
        head {
          ...CoverageForFile
        }
      }
    }
  }
}

fragment CoverageForFile on Commit {
  commitid
  flagNames
  coverageFile(path: $path) {
    isCriticalFile
    content
    coverage {
      line
      coverage
    }
    totals {
      coverage # Absolute coverage of the commit
    }
  }
}
`

export function usePrefetchBranchFileEntry({ branch, path, options = {} }) {
  const { provider, owner, repo } = useParams()
  const queryClient = useQueryClient()

  const runPrefetch = async () =>
    await queryClient.prefetchQuery(
      ['commit', provider, owner, repo, branch, path],
      () =>
        Api.graphql({
          provider,
          query,
          variables: {
            provider,
            owner,
            repo,
            ref: branch,
            path,
          },
        }).then(extractCoverageFromResponse),
      {
        staleTime: 10000,
      }
    )

  return { runPrefetch }
}
