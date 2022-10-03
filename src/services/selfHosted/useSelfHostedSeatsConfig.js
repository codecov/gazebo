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

  return useQuery(['Seats'], () => Api.graphql({ provider, query }), {
    select: ({ data }) => data?.config,
    ...options,
  })
}
