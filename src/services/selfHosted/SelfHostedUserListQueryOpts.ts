import { infiniteQueryOptions as infiniteQueryOptionsV5 } from '@tanstack/react-queryV5'
import { z } from 'zod'

import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/helpers'

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

interface SelfHostedUserListQueryArgs {
  activated?: boolean
  search?: string
  isAdmin?: boolean
}

export const SelfHostedUserListQueryOpts = ({
  activated,
  search,
  isAdmin,
}: SelfHostedUserListQueryArgs) => {
  return infiniteQueryOptionsV5({
    queryKey: ['SelfHostedUserList', activated, search, isAdmin],
    queryFn: ({ pageParam, signal }) => {
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
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'SelfHostedUserListQueryOpts - 404 schema parsing failed',
            error: parsedData.error,
          })
        }

        return parsedData.data
      })
    },
    initialPageParam: '1',
    getNextPageParam: (data) => {
      if (data?.next) {
        const { searchParams } = new URL(data.next)
        return searchParams.get('page')
      }
      return null
    },
  })
}
