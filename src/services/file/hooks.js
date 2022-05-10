import keyBy from 'lodash/keyBy'
import mapValues from 'lodash/mapValues'
import { useQuery } from 'react-query'

import Api from 'shared/api'

function extractCoverageFromResponse(res) {
  const commit = res?.data?.owner?.repository?.commit
  const branch = res?.data?.owner?.repository?.branch?.head
  const coverageSource = commit || branch
  const coverageFile = coverageSource?.coverageFile
  if (!coverageFile) return null
  const lineWithCoverage = keyBy(coverageFile.coverage, 'line')
  const fileCoverage = mapValues(lineWithCoverage, 'coverage')
  const coverageTotal = coverageFile.totals?.coverage
  return {
    content: coverageFile.content,
    coverage: fileCoverage,
    totals: isNaN(coverageTotal) ? 0 : coverageTotal,
    flagNames: coverageSource?.flagNames ?? [],
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

export function useCommitBasedCoverageForFileViewer({
  owner,
  repo,
  provider,
  commit,
  path,
  selectedFlags,
}) {
  const { data } = useFileWithMainCoverage({
    provider,
    owner,
    repo,
    ref: commit,
    path,
  })

  const coverageForAllFlags = selectedFlags.length === 0

  const queryPerFlag = useCoverageWithFlags(
    {
      provider,
      owner,
      repo,
      ref: commit,
      path,
      flags: selectedFlags,
    },
    {
      // only run the query if we are filtering per flag
      enabled: !coverageForAllFlags,
      suspense: false,
    }
  )

  if (coverageForAllFlags) {
    // no flag selected, we can return the default coverage
    return {
      coverage: data?.coverage,
      totals: data?.totals,
      flagNames: data?.flagNames,
      content: data?.content,
      isLoading: false,
    }
  }

  return {
    coverage: queryPerFlag.data?.coverage ?? {},
    totals: queryPerFlag.data?.totals ?? 0,
    isLoading: queryPerFlag.isLoading,
    flagNames: data?.flagNames,
    content: data?.content,
  }
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
