import { useQuery } from 'react-query'

import Api from 'shared/api'

import { extractCoverageFromResponse } from './utils'

export function useFileWithMainCoverage({ provider, owner, repo, ref, path }) {
  const query = `
    query CoverageForFile($owner: String!, $repo: String!, $ref: String!, $path: String!) {
        owner(username: $owner) {
            repository(name: $repo){
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
  return useQuery(['commit', provider, owner, repo, ref, path], () => {
    return Api.graphql({
      provider,
      query,
      variables: {
        provider,
        owner,
        repo,
        ref,
        path,
      },
    }).then(extractCoverageFromResponse)
  })
}
