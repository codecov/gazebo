import Api from 'shared/api'
import { useQuery } from 'react-query'
import keyBy from 'lodash/keyBy'
import mapValues from 'lodash/mapValues'

function extractCoverageFromResponse(res) {
  const commit = res?.data?.owner?.repository?.commit
  const branch = res?.data?.owner?.repository?.branch?.head
  const coverageSource = commit || branch
  const coverageFile = coverageSource.coverageFile
  if (!coverageFile) return null
  const lineWithCoverage = keyBy(coverageFile.coverage, 'line')
  const fileCoverage = mapValues(lineWithCoverage, 'coverage')
  return {
    content: coverageFile.content,
    coverage: fileCoverage,
    totals: coverageFile.totals,
    flagNames: coverageSource?.flagNames,
  }
}

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
            coverage {
              line
              coverage
            }
            totals {
              coverage
            }
          }
        }
      }
    }
  }
  `

  return useQuery(
    ['coverage', provider, owner, repo, ref, path, flags],
    () => {
      return Api.graphql({
        provider,
        query,
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
