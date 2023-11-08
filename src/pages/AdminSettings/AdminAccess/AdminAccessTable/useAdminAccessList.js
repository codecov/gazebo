import { useInfiniteQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'

export const useAdminAccessList = () => {
  const { provider } = useParams()

  return useInfiniteQuery({
    queryKey: ['AdminAccessList', provider],
    queryFn: ({ pageParam = 1, signal }) =>
      Api.get({
        path: `/users?is_admin=true&page=${pageParam}`,
        signal,
        provider,
      }),
    select: ({ pages }) => pages.map(({ results }) => results).flat(),
    getNextPageParam: (data) => {
      if (data?.next) {
        const { searchParams } = new URL(data.next)
        return searchParams.get('page')
      }
      return undefined
    },
  })
}
