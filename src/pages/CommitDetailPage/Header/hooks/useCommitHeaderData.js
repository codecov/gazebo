import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

const query = `
  query CommitPageHeaderData($owner: String!, $repo: String!, $commitId: String!) {
    owner(username: $owner) {
      repository(name: $repo) {
        commit(id: $commitId) {
          author {
            username
          }
          branchName
          ciPassed
          commitid
          createdAt
          message
          pullId
        }
      }
    }
  }
`

export const useCommitHeaderData = ({ provider, owner, repo, commitId }) =>
  useQuery({
    queryKey: ['CommitPageHeaderData', provider, owner, repo, commitId, query],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          provider,
          owner,
          repo,
          commitId,
        },
      }).then((res) => res?.data?.owner?.repository?.commit),
  })
