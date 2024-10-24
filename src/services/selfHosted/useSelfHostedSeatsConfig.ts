import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'

const query = `
query Seats {
  config {
    seatsUsed
    seatsLimit
  }
}
`

export const useSelfHostedSeatsConfig = (options = {}) => {
  const { provider } = useParams()

  return useQuery({
    queryKey: ['Seats', provider, query],
    queryFn: ({ signal }) => Api.graphql({ provider, query, signal }),
    select: ({ data }) => data?.config,
    ...options,
  })
}
