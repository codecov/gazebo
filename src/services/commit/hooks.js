import { useState, useEffect } from 'react'
import Api from 'shared/api'
import { useQuery } from 'react-query'
import { mapEdges } from 'shared/utils/graphql'

export function useCommitYaml({ provider, owner, repo, commitid }) {
  const query = `
    query CommitYaml($owner: String!, $repo: String!, $commitid: String!) {
      owner(username: $owner) {
        repository(name: $repo) {
          commit(id: $commitid) {
            commitid
            yaml
          }
        }
      }
    }
  `

  return useQuery(['commit-yaml', provider, owner, repo, commitid], () => {
    return Api.graphql({
      provider,
      query,
      variables: {
        owner,
        repo,
        commitid,
      },
    }).then((res) => {
      return res?.data?.owner?.repository?.commit?.yaml
    })
  })
}

function useCompareTotals({ provider, owner, repo, commitid, opts = {} }) {
  const query = `
    query CompareTotals($owner: String!, $repo: String!, $commitid: String!) {
      owner(username: $owner) {
        repository(name: $repo) {
          commit(id: $commitid) {
            compareWithParent {
              state
              impactedFiles {
                patch {
                  coverage
                }
                headName
                baseCoverage {
                  coverage
                }
                headCoverage {
                  coverage
                }
                patchCoverage {
                  coverage
                }
              }
            }
          }
        }
      }
    }
  `

  return useQuery(
    ['impactedFiles', provider, owner, repo, commitid],
    () => {
      return Api.graphql({
        provider,
        query,
        variables: {
          owner,
          repo,
          commitid,
        },
      }).then((res) => {
        return res?.data?.owner?.repository?.commit?.compareWithParent
      })
    },
    {
      ...opts,
    }
  )
}

export function useImpactedFiles({ provider, owner, repo, commitid, opts }) {
  const defaultOpts = {
    pollingMs: 2000,
  }
  const { pollingMs } = Object.assign({}, defaultOpts, opts)
  const [polling, setPolling] = useState(pollingMs)
  const { data, isLoading, ...all } = useCompareTotals({
    provider,
    owner,
    repo,
    commitid,
    opts: { refetchInterval: polling, ...opts },
  })
  useEffect(() => {
    const newPolling =
      !isLoading && data && data?.state.toUpperCase() !== 'PENDING'
        ? false
        : polling
    setPolling(newPolling)
  }, [polling, isLoading, data])

  return { data, isLoading, ...all }
}

export function useCommit({ provider, owner, repo, commitid }) {
  const query = `
    query Commit($owner: String!, $repo: String!, $commitid: String!) {
        owner(username: $owner) {
          repository(name: $repo) {
            commit(id: $commitid) {
              totals {
                coverage # Absolute coverage of the commit
              }
              commitid
              pullId
              createdAt
              author {
                  username
              }
              uploads {
                  edges {
                      node {
                          state
                          provider
                          createdAt
                          updatedAt
                          flags
                          jobCode
                          downloadUrl
                          ciUrl
                          uploadType
                      }
                  }
              }
              message
              ciPassed
              parent {
                commitid # commitid of the parent, used for the comparison

                totals {
                  coverage # coverage of the parent
                }
              }
            }
          }
        }
      }
    `

  return useQuery(['commit', provider, owner, repo, commitid], () => {
    return Api.graphql({
      provider,
      query,
      variables: {
        provider,
        owner,
        repo,
        commitid,
      },
    }).then((res) => {
      const commit = res?.data?.owner?.repository?.commit
      if (!commit) return null
      return {
        commit: {
          ...commit,
          uploads: mapEdges(commit?.uploads),
        },
      }
    })
  })
}
