import map from 'lodash/map'
import { useQuery, useQueryClient } from 'react-query'

import Api from 'shared/api'
import { mapEdges } from 'shared/utils/graphql'
const comparisonFragment = `
  fragment ComparisonFragment on Commit {
    compareWithParent {
      state
      patchTotals {
        coverage
      }
      impactedFiles {
        patchCoverage {
          coverage
        }
        headName
        baseCoverage {
          coverage
        }
        headCoverage {
          coverage
        }
      }
    }
  }
`

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
            ...ComparisonFragment
          }
        }
      }
    }
    ${comparisonFragment}
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

export function useCommit({
  provider,
  owner,
  repo,
  commitid,
  refetchInterval = 2000,
}) {
  const query = `
    query Commit($owner: String!, $repo: String!, $commitid: String!) {
        owner(username: $owner) {
          repository(name: $repo) {
            commit(id: $commitid) {
              totals {
                coverage # Absolute coverage of the commit
              }
              state
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
                          buildCode
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
              ...ComparisonFragment
            }
          }
        }
      }
      ${comparisonFragment}
    `

  const cacheKey = ['commit', provider, owner, repo, commitid]

  function processUploads(uploads) {
    const edgelessUploads = mapEdges(uploads)
    return map(edgelessUploads, (upload) => ({
      ...upload,
      errors: mapEdges(upload?.errors),
    }))
  }

  const commitQuery = useQuery(cacheKey, () => {
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
          uploads: processUploads(commit?.uploads),
        },
      }
    })
  })

  const queryClient = useQueryClient()

  const state = commitQuery?.data?.commit?.compareWithParent?.state
  const shouldPoll = state === 'pending'

  useCompareTotals({
    provider,
    owner,
    repo,
    commitid,
    opts: {
      refetchInterval,
      enabled: shouldPoll,
      onSuccess: (data) => {
        const impactedFileData = {
          ...commitQuery?.data,
          commit: {
            ...commitQuery?.data.commit,
            compareWithParent: data,
          },
        }
        queryClient.setQueryData(cacheKey, impactedFileData)
      },
    },
  })

  return commitQuery
}
