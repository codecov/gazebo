import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

const query = `
  query GetBranch($owner: String!, $repo: String!, $branch: String!) {
    owner(username: $owner) {
      repository(name: $repo) {
        branch(name: $branch) {
          name
          head {
            commitid
          }
        }
      }
    }
  }
`

export const useBranch = ({ provider, owner, repo, branch, opts = {} }) =>
  useQuery({
    queryKey: ['GetBranch', provider, owner, repo, branch],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
          repo,
          branch,
        },
      }).then((res) => res?.data?.owner?.repository ?? {}),
    ...opts,
  })
