import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'
import { userHasAccess } from 'shared/utils/user'

import {
  CommitsOnPullFragment,
  FlagComparisonsOnPull,
  HeaderOnPullFragment,
  ImpactedFilesOnPull,
  SummaryOnPullFragment,
} from './fragments'

export function usePull({
  provider,
  owner,
  repo,
  pullId,
  filters = {},
  options = {},
}) {
  const query = `
    query Pull($owner: String!, $repo: String!, $pullId: Int!, $filters: ImpactedFilesFilters!) {
        owner(username: $owner) {
          isCurrentUserPartOfOrg
          repository(name: $repo) {
            defaultBranch
            private
            pull(id: $pullId) {
              ...CommitsOnPullFragment
              ...FlagComparisonsOnPull
              ...HeaderOnPullFragment
              ...ImpactedFilesOnPull
              ...SummaryOnPullFragment
            }
          }
        }
      }
      ${CommitsOnPullFragment}
      ${FlagComparisonsOnPull}
      ${HeaderOnPullFragment}
      ${ImpactedFilesOnPull}
      ${SummaryOnPullFragment}
    `
  // TODO: Find a way to only make 1 request per usePull call (there's 2 different calls based on the filters)
  return useQuery({
    queryKey: ['pull', provider, owner, repo, pullId, filters, query],
    queryFn: ({ signal }) => {
      return Api.graphql({
        provider,
        query,
        signal,
        variables: {
          provider,
          owner,
          repo,
          pullId: parseInt(pullId, 10),
          filters,
        },
      }).then((res) => {
        return {
          hasAccess: userHasAccess({
            privateRepo: res?.data?.owner?.repository?.private,
            isCurrentUserPartOfOrg: res?.data?.owner?.isCurrentUserPartOfOrg,
          }),
          defaultBranch: res?.data?.owner?.repository?.defaultBranch,
          pull: res?.data?.owner?.repository?.pull,
        }
      })
    },
    ...options,
  })
}
