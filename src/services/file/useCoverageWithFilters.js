import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

import { extractCoverageFromResponse } from './utils'

export function useCoverageWithFilters({
  provider,
  owner,
  repo,
  ref,
  path,
  flags,
  opts,
}) {
  const query = `
  query CoverageForFileWithFilters($owner: String!, $repo: String!, $ref: String!, $path: String!, $flags: [String], $components: [String]) {
    owner(username: $owner) {
      repository: repositoryDeprecated(name: $repo){
        commit(id: $ref) {
          coverageFile(path: $path, flags: $flags, components: $components) {
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
    coverageFile(path: $path, flags: $flags) {
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

  return useQuery({
    queryKey: [
      'coverage',
      provider,
      owner,
      repo,
      ref,
      path,
      flags,
      query,
      extractCoverageFromResponse,
    ],
    queryFn: ({ signal }) => {
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
    ...(!!opts && opts),
  })
}
