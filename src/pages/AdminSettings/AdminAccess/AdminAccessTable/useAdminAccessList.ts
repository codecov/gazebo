import { useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { z } from 'zod'

import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'

const RequestSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(
    z.object({
      ownerid: z.number(),
      username: z.string().nullable(),
      email: z.string().nullable(),
      name: z.string().nullable(),
      isAdmin: z.boolean(),
      activated: z.boolean(),
    })
  ),
  totalPages: z.number(),
})

export const useAdminAccessList = () => {
  const { data, ...rest } = useInfiniteQuery({
    queryKey: ['AdminAccessList'],
    queryFn: ({ pageParam = 1, signal }) =>
      Api.get({
        path: `/users?is_admin=true&page=${pageParam}`,
        signal,
      }).then((res) => {
        const parsedData = RequestSchema.safeParse(res)

        if (!parsedData.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useAdminAccessList - 404 schema parsing failed',
          } satisfies NetworkErrorObject)
        }
        return parsedData.data
      }),
    getNextPageParam: (data) => {
      if (data?.next) {
        const { searchParams } = new URL(data.next)
        return searchParams.get('page')
      }
      return undefined
    },
  })

  return {
    data: useMemo(
      () => data?.pages.flatMap((page) => page.results) ?? [],
      [data?.pages]
    ),
    ...rest,
  }
}
