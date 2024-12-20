import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'

interface URLParams {
  provider: string
}

interface UseOwnerArgs {
  username?: string
  opts?: {
    suspense?: boolean
    enabled?: boolean
  }
}

export function useOwner({
  username,
  opts = { enabled: username !== undefined },
}: UseOwnerArgs) {
  const { provider } = useParams<URLParams>()
  const query = `
    query DetailOwner($username: String!) {
      owner(username: $username) {
        ownerid
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

  return useQuery({
    queryKey: ['owner', variables, provider, query],
    queryFn: ({ signal }) =>
      Api.graphql({ provider, query, variables, signal }).then((res) => {
        return res?.data?.owner
      }),
    ...opts,
  })
}
