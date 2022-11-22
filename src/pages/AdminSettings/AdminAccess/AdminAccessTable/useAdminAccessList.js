import { useInfiniteQuery } from '@tanstack/react-query'

import Api from 'shared/api'

export const useAdminAccessList = () => {
  const fetchResponse = useInfiniteQuery(
    ['AdminAccessList'],
    ({ pageParam = 1, signal }) =>
      Api.get({ path: `/users?is_admin=true&page=${pageParam}`, signal }),
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

  return {
    ...fetchResponse,
  }
}
