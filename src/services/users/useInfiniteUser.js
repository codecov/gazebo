import { useInfiniteQuery } from '@tanstack/react-query'

import Api from 'shared/api'

export const useInfiniteUsers = ({ provider, owner, query }, opts = {}) => {
  return useInfiniteQuery(
    ['InfiniteUsers', provider, owner, query],
    ({ pageParam = 1 }) =>
      Api.get({
        path: `/${provider}/${owner}/users/`,
        provider,
        query: {
          ...query,
          pageSize: 25,
          page: pageParam,
        },
      }),
    {
      select: ({ pages }) => pages.map(({ results }) => results).flat(),
      getNextPageParam: (data) => {
        if (data?.next) {
          const { searchParams } = new URL(data.next)
          return searchParams.get('page')
        }
        return undefined
      },
      ...opts,
    }
  )
}
