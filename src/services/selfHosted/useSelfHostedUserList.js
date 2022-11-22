import { useInfiniteQuery } from '@tanstack/react-query'

import Api from 'shared/api'

export const useSelfHostedUserList = ({ activated, search, isAdmin }) =>
  useInfiniteQuery(
    ['SelfHostedUserList', activated, search, isAdmin],
    ({ pageParam = 1, signal }) => {
      return Api.get({
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
    {
      select: ({ pages }) => pages.map(({ results }) => results).flat(),
      getNextPageParam: (data) => {
        if (data?.next) {
          const { searchParams } = new URL(data.next)
          return searchParams.get('page')
        }
        return undefined
      },
    }
  )
