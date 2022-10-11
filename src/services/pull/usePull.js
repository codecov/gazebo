import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'
import { userHasAccess } from 'shared/utils/user'

import {
  CommitsOnPullFragment,
  FlagComparisonsOnPull,
  HeaderOnPullFragment,
  // ImpactedFilesOnPull,
  SummaryOnPullFragment,
} from './fragments'

export function usePull({ provider, owner, repo, pullId }) {
  // TODO: We should revisit this hook cause I'm almost confident we don't need all this info, specially the filecomparisons part
  const query = `
    ${HeaderOnPullFragment}
    ${SummaryOnPullFragment}
    ${CommitsOnPullFragment}
    ${FlagComparisonsOnPull}
    query Pull($owner: String!, $repo: String!, $pullId: Int!) {
        owner(username: $owner) {
          isCurrentUserPartOfOrg
          repository(name: $repo) {
            private
            pull(id: $pullId) {
              ...HeaderOnPullFragment
              ...SummaryOnPullFragment
              ...CommitsOnPullFragment
              ...FlagComparisonsOnPull
            }
          }
        }
      }
    `

  return useQuery(['pull', provider, owner, repo, pullId], () => {
    return Api.graphql({
      provider,
      query,
      variables: {
        provider,
        owner,
        repo,
        pullId: parseInt(pullId, 10),
      },
    }).then((res) => {
      return {
        hasAccess: userHasAccess({
          privateRepo: res?.data?.owner?.repository?.private,
          isCurrentUserPartOfOrg: res?.data?.owner?.isCurrentUserPartOfOrg,
        }),
        pull: res?.data?.owner?.repository?.pull,
      }
    })
  })
}
