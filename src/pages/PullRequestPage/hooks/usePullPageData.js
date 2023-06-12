import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'
import { userHasAccess } from 'shared/utils/user'

const query = `
  query PullPageData ($owner: String!, $repo: String!, $pullId: Int!) {
    owner(username: $owner) {
      isCurrentUserPartOfOrg
      repository: repositoryDeprecated(name: $repo) {
        private
        pull(id: $pullId) {
          pullId
          head {
            commitid
          }
          compareWithBase {
            ... on Comparison {
              impactedFilesCount
              indirectChangedFilesCount
              directChangedFilesCount
              flagComparisonsCount
              componentComparisonsCount
            }
            __typename
          }
        }
      }
    }
  }
`

export const usePullPageData = ({ provider, owner, repo, pullId }) =>
  useQuery({
    queryKey: ['PullPageData', provider, owner, repo, pullId, query],
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
      }).then((res) => ({
        hasAccess: userHasAccess({
          privateRepo: res?.data?.owner?.repository?.private,
          isCurrentUserPartOfOrg: res?.data?.owner?.isCurrentUserPartOfOrg,
        }),
        pull: res?.data?.owner?.repository?.pull,
      })),
  })
