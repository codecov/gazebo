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
                path
                baseTotals {
                  coverage
                }
                compareTotals {
                  coverage
                }
                patch {
                  coverage
                }
              }
            }
          }
        }
      }
    }
  `
  const defaultOpts = {
    pollingMs: 2000,
    enabled: true,
  }
  const { pollingMs: refetchInterval, enabled } = Object.assign(
    {},
    defaultOpts,
    opts
  )

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
      }).then(
        (res) =>
          res?.data?.owner?.repository?.commit?.compare?.compareWithParent
      )
    },
    {
      refetchInterval,
      enabled,
    }
  )
}

export function useImpactedFiles({
  provider,
  owner,
  repo,
  commitid,
  opts = {},
}) {
  const [pollingEnabled, setPollingEnabled] = useState(true)
  const { data, isLoading, ...all } = useCompareTotals({
    provider,
    owner,
    repo,
    commitid,
    opts: { enabled: pollingEnabled, ...opts },
  })

  useEffect(() => {
    setPollingEnabled(!isLoading && data?.state !== 'PROCESSED')
  }, [pollingEnabled, isLoading, data])

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
