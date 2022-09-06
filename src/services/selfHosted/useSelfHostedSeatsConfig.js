import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

export const useSelfHostedSeatsConfig = (options = {}) => {
  const query = `
    query Seats {
      config {
        seatsUsed
        seatsLimit
      }
    }
  `
  const apiResponse = useQuery(['Seats'], () => Api.graphql({ query }), {
    select: ({ data }) => data?.config,
    ...options,
  })

  return apiResponse
}
