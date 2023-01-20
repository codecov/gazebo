import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'

export function useOwnerPageData({ username, opts = {} }) {
  const { provider } = useParams()
  const query = `
      query OwnerPageData($username: String!) {
        owner(username: $username) {
          username
          isCurrentUserPartOfOrg
          numberOfUploads
        }
      }
    `

  const variables = {
    username,
  }

  return useQuery(
    ['OwnerPageData', variables, provider],
    ({ signal }) =>
      Api.graphql({ provider, query, variables, signal }).then((res) => {
        return res?.data?.owner
      }),
    opts
  )
}
