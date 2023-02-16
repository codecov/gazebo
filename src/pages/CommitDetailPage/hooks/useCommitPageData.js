import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

const query = `
  query CommitPageData($owner: String!, $repo: String!, $commitId: String!) {
    owner(username: $owner) {
      isCurrentUserPartOfOrg
      repository(name: $repo) {
        commit(id: $commitId) {
          commitid
        }
      }
    }
  }
`

export const useCommitPageData = ({ provider, owner, repo, commitId }) =>
  useQuery({
    queryKey: ['CommitPageData', provider, owner, repo, commitId, query],
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
      }).then((res) => ({
        isCurrentUserPartOfOrg: res?.data?.owner?.isCurrentUserPartOfOrg,
        commit: res?.data?.owner?.repository?.commit,
      })),
  })
