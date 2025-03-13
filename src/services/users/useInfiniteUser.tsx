import { useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { z } from 'zod'

import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'

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

export const MemberListSchema = z
  .object({
    count: z.number(),
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(MemberSchema),
    totalPages: z.number(),
  })
  .nullable()

export type MemberList = z.infer<typeof MemberListSchema>

export interface InfiniteUsersQuery {
  provider: string
  owner: string
  query: {
    activated?: boolean
    isAdmin?: boolean
    ordering?: string
    search?: string
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
  const {
    data,
    error,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['users', provider, owner, query],
    queryFn: ({ pageParam = 1, signal }) =>
      Api.get({
        path: `/${provider}/${owner}/users/`,
        provider,
        signal,
        query: {
          pageSize: 25,
          ...query,
          page: pageParam,
        },
      }).then((res) => {
        const callingFn = 'useInfiniteUsers'
        const parsedRes = MemberListSchema.safeParse(res)

        if (!parsedRes.success) {
          return rejectNetworkError({
            errorName: 'Parsing Error',
            errorDetails: { callingFn, error: parsedRes.error },
          })
        }

        return parsedRes.data
      }),
    select: (data) => {
      return {
        pages: data.pages,
        results: data.pages.flatMap((page) => page?.results ?? []),
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
    data: useMemo(
      () => data?.pages.flatMap((page) => page?.results ?? []),
      [data]
    ),
    error,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  }
}
