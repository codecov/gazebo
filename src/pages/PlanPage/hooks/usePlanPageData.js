import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'

export function usePlanPageData({ username, opts = {} }) {
  const { provider } = useParams()
  const query = `
      query PlanPageData($username: String!) {
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
    ['PlanPageData', variables, provider],
    ({ signal }) =>
      Api.graphql({ provider, query, variables, signal }).then((res) => {
        return res?.data?.owner
      }),
    opts
  )
}
