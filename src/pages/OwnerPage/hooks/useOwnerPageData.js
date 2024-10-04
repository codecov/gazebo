import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'

export function useOwnerPageData(opts = {}) {
  const { owner, provider } = useParams()
  const query = `
      query OwnerPageData($username: String!) {
        owner(username: $username) {
          username
          isCurrentUserPartOfOrg
          numberOfUploads
          avatarUrl
        }
      }
    `
  const variables = {
    username: owner,
  }

  return useQuery({
    queryKey: ['OwnerPageData', variables, provider, query],
    queryFn: ({ signal }) =>
      Api.graphql({ provider, query, variables, signal }).then((res) => {
        return res?.data?.owner
      }),
    ...opts,
  })
}
