import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

const query = `
query Seats {
  config {
    seatsUsed
    seatsLimit
  }
}
`

export const useSelfHostedSeatsConfig = (options = {}) =>
  useQuery(['Seats'], () => Api.graphql({ query }), {
    select: ({ data }) => data?.config,
    ...options,
  })
