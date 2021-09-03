import { useEffect } from 'react'
import Api from 'shared/api'
import { useQuery, useQueryClient } from 'react-query'
import { mapEdges } from 'shared/utils/graphql'
import usePrevious from 'react-use/lib/usePrevious'

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

async function fetchCompareTotals({ provider, owner, repo, commitid }) {
  const query = `
  query Commit($owner: String!, $repo: String!, $commitid: String!) {
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
  const res = await Api.graphql({
    provider,
    query,
    variables: {
      provider,
      owner,
      repo,
      commitid,
    },
  })
  return res?.data?.owner?.repository?.commit?.compareWithParent || {}
}

export function useImpactedFiles({ provider, owner, repo, commitid }) {
  const queryClient = useQueryClient()

  const keyCache = ['impactedFiles', provider, owner, repo, commitid]

  const impactedFilesCache = queryClient.getQueryData(keyCache)
  const isPolling = impactedFilesCache
    ? impactedFilesCache.state === 'PENDING'
    : true

  useQuery(
    keyCache,
    async () => await fetchCompareTotals({ provider, owner, repo, commitid }),
    {
      suspense: false,
      useErrorBoundary: false,
      // refetch every 2 seconds if we are syncing
      refetchInterval: isPolling ? 2000 : null,
    }
  )
  const prevIsPolling = usePrevious(isPolling)

  useEffect(() => {
    if (prevIsPolling && !isPolling) {
      queryClient.refetchQueries(['repos'])
    }
  }, [prevIsPolling, isPolling, queryClient])

  return {
    impactedFiles: impactedFilesCache?.impactedFiles,
    loading: isPolling,
  }
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
