import { useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { z } from 'zod'

import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'

export const MemberSchema = z.object({
  activated: z.boolean(),
  email: z.string().nullable(),
  isAdmin: z.boolean(),
  lastPullTimestamp: z.string().nullable(),
  name: z.string().nullable(),
  ownerid: z.number(),
  student: z.boolean(),
  username: z.string().nullable(),
})

export type Member = z.infer<typeof MemberSchema>

export const MemberListSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(MemberSchema),
  totalPages: z.number(),
})

export type MemberList = z.infer<typeof MemberListSchema>

export interface InfiniteUsersQuery {
  provider: string
  owner: string
  query: {
    activated?: boolean
    isAdmin?: boolean
    ordering?: string
    search?: string
    page?: number
    pageSize?: number
  }
}

export const useInfiniteUsers = (
  { provider, owner, query }: InfiniteUsersQuery,
  opts: {
    suspense?: boolean
    retry?: boolean
  }
) => {
  const { data, ...rest } = useInfiniteQuery({
    queryKey: ['users', provider, owner, query],
    queryFn: ({ pageParam = 1, signal }) =>
      Api.get({
        path: `/${provider}/${owner}/users/`,
        provider,
        signal,
        query: {
          pageSize: 25,
          page: pageParam,
          ...query,
        },
      }).then((res) => {
        const parsedRes = MemberListSchema.safeParse(res)

        if (!parsedRes.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useInfiniteUser - 404 failed to parse',
          } satisfies NetworkErrorObject)
        }

        return parsedRes.data
      }),
    select: (data) => {
      return {
        pages: data.pages,
        results: data.pages.flatMap((page) => page.results),
        pageParams: data.pageParams,
      }
    },
    getNextPageParam: (data) => {
      if (data?.next) {
        const { searchParams } = new URL(data.next)
        return searchParams.get('page')
      }
      return undefined
    },
    ...opts,
  })

  return {
    data: useMemo(() => data?.pages.flatMap((page) => page.results), [data]),
    ...rest,
  }
}
