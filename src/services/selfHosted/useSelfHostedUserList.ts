import { useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { z } from 'zod'

import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'

const OwnerSchema = z.object({
  ownerid: z.number(),
  username: z.string().nullable(),
  email: z.string().nullable(),
  name: z.string().nullable(),
  isAdmin: z.boolean(),
  activated: z.boolean(),
})

export type UserListOwner = z.infer<typeof OwnerSchema>

const RequestSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(OwnerSchema),
  totalPages: z.number(),
})

interface UseSelfHostedUserListArgs {
  activated?: boolean
  search?: string
  isAdmin?: boolean
}

export const useSelfHostedUserList = ({
  activated,
  search,
  isAdmin,
}: UseSelfHostedUserListArgs) => {
  const { data, ...rest } = useInfiniteQuery({
    queryKey: ['SelfHostedUserList', activated, search, isAdmin],
    queryFn: ({ pageParam = 1, signal }) => {
      return Api.get({
        path: '/users',
        signal,
        query: {
          activated,
          isAdmin,
          search: search ? search : undefined,
          page: pageParam,
        },
      }).then((res) => {
        const parsedData = RequestSchema.safeParse(res)

        if (!parsedData.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useSelfHostedUserList - 404 schema parsing failed',
          } satisfies NetworkErrorObject)
        }
        return parsedData.data
      })
    },
    suspense: false,
    getNextPageParam: (data) => {
      if (data?.next) {
        const { searchParams } = new URL(data.next)
        return searchParams.get('page')
      }
      return undefined
    },
  })

  const memoedData = useMemo(
    () => data?.pages?.flatMap((page) => page.results) ?? [],
    [data]
  )

  return {
    ...rest,
    data: memoedData,
  }
}
