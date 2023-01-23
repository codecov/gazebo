import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'

export function usePlanPageData(opts) {
  const { owner, provider } = useParams()
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
    username: owner,
  }

  return useQuery(
    ['PlanPageData', variables, provider],
    ({ signal }) =>
      Api.graphql({ provider, query, variables, signal }).then(
        (res) => res?.data?.owner
      ),
    opts
  )
}
