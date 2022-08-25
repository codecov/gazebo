import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

export function useFlagsForComparePage({ provider, owner, repo, pullId }) {
  const query = `
    query FlagComparisons($owner: String!, $repo: String!, $pullId: Int!) {
        owner(username: $owner) {
          repository(name: $repo) {
            pull(id: $pullId) {
              compareWithBase {
                flagComparisons {
                  name
                  patchTotals {
                    percentCovered
                  }
                  headTotals {
                    percentCovered
                  }
                  baseTotals {
                    percentCovered
                  }
                }
              }
            }
          }
        }
      }
    `
  return useQuery(['flagComparisons', provider, owner, repo, pullId], () => {
    return Api.graphql({
      provider,
      query,
      variables: {
        provider,
        owner,
        repo,
        pullId: parseInt(pullId, 10),
      },
    }).then(
      (res) =>
        res?.data?.owner?.repository?.pull?.compareWithBase?.flagComparisons
    )
  })
}
