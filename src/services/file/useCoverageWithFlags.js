import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

import { extractCoverageFromResponse } from './utils'

export function useCoverageWithFlags(
  { provider, owner, repo, ref, path, flags },
  options = {}
) {
  const query = `
  query CoverageForFileWithFlags($owner: String!, $repo: String!, $ref: String!, $path: String!, $flags: [String]) {
    owner(username: $owner) {
      repository(name: $repo){
        commit(id: $ref) {
          coverageFile(path: $path, flags: $flags) {
            isCriticalFile
            coverage {
              line
              coverage
            }
            totals {
              coverage
            }
          }
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
    coverageFile(path: $path) {
      isCriticalFile
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

  return useQuery(
    ['coverage', provider, owner, repo, ref, path, flags],
    ({ signal }) => {
      return Api.graphql({
        provider,
        query,
        signal,
        variables: {
          provider,
          owner,
          repo,
          ref,
          path,
          flags,
        },
      }).then(extractCoverageFromResponse)
    },
    options
  )
}
