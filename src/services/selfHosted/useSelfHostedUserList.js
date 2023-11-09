import { useInfiniteQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'

export const useSelfHostedUserList = ({ activated, search, isAdmin }) => {
  const { provider } = useParams()

  return useInfiniteQuery({
    queryKey: ['SelfHostedUserList', provider, activated, search, isAdmin],
    queryFn: ({ pageParam = 1, signal }) => {
      return Api.get({
        provider,
        path: '/users',
        signal,
        query: {
          activated,
          isAdmin,
          search: search ? search : undefined,
          page: pageParam,
        },
      })
    },
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
