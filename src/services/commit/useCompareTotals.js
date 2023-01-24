import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

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

export function useCompareTotals({
  provider,
  owner,
  repo,
  commitid,
  opts = {},
}) {
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
    ({ signal }) => {
      return Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
          repo,
          commitid,
        },
      }).then(
        (res) => res?.data?.owner?.repository?.commit?.compareWithParent ?? {}
      )
    },
    {
      ...opts,
    }
  )
}
