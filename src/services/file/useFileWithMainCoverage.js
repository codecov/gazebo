import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

import { extractCoverageFromResponse } from './utils'

export function useFileWithMainCoverage({ provider, owner, repo, ref, path }) {
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
        hashedPath
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
