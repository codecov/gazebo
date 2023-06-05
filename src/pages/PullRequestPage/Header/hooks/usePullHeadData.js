import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

const query = `
  query PullHeadData ($owner: String!, $repo: String!, $pullId: Int!) {
    owner(username: $owner) {
      repository: repositoryDeprecated(name: $repo) {
        pull(id: $pullId) {
          pullId
          title
          state
          author {
            username
          }
          head {
            branchName
            ciPassed
          }
          updatestamp
        }
      }
    }
  }
`

export const usePullHeadData = ({ provider, owner, repo, pullId }) =>
  useQuery({
    queryKey: ['PullHeader', provider, owner, repo, pullId, query],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          provider,
          owner,
          repo,
          pullId: parseInt(pullId, 10),
        },
      }).then((res) => res?.data),
    select: (data) => data?.owner?.repository?.pull || {},
  })
