import { useInfiniteQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
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
      username: z.string(),
      email: z.string(),
      name: z.string().nullable(),
      isAdmin: z.boolean(),
      activated: z.boolean(),
    })
  ),
  totalPages: z.number(),
})

type URLParams = {
  provider: string
}

export const useAdminAccessList = () => {
  const { provider } = useParams<URLParams>()

  const { data, ...rest } = useInfiniteQuery({
    queryKey: ['AdminAccessList', provider],
    queryFn: ({ pageParam = 1, signal }) =>
      Api.get({
        path: `/users?is_admin=true&page=${pageParam}`,
        signal,
        provider,
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
    data: data?.pages.flatMap((page) => page.results) ?? [],
    ...rest,
  }
}
