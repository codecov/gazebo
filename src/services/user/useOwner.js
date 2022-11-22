import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'

export function useOwner({ username, opts = {} }) {
  const { provider } = useParams()
  const query = `
      query DetailOwner($username: String!) {
        owner(username: $username) {
          orgUploadToken
          hashOwnerid
          username
          avatarUrl
          isCurrentUserPartOfOrg
          isAdmin
        }
      }
    `

  const variables = {
    username,
  }

  return useQuery(
    ['owner', variables, provider],
    ({ signal }) =>
      Api.graphql({ provider, query, variables, signal }).then((res) => {
        return res?.data?.owner
      }),
    opts
  )
}
