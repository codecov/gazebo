import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'

const OwnerSchema = z
  .object({
    avatarUrl: z.string().nullish(),
    integrationId: z.number().nullish(),
    name: z.string().nullish(),
    ownerid: z.number().nullish(),
    service: z.string().nullish(),
    stats: z
      .object({
        repos: z.number().nullish(),
      })
      .nullish(),
    username: z.string().nullish(),
  })
  .nullish()

export type InternalUserOwnerData = z.infer<typeof OwnerSchema>

const InternalUserSchema = z
  .object({
    email: z.string().nullish(),
    name: z.string().nullish(),
    externalId: z.string().nullish(),
    owners: z.array(OwnerSchema).nullish(),
  })
  .nullish()

export type InternalUserData = z.infer<typeof InternalUserSchema>

export interface UseInternalUserArgs {
  opts?: UseQueryOptions<InternalUserData>
}

export const useInternalUser = (opts: UseInternalUserArgs) =>
  useQuery({
    queryKey: ['InternalUser'],
    queryFn: ({ signal }) => {
      return Api.get({
        path: '/user',
        signal,
      }).then((res) => InternalUserSchema.parse(res))
    },
    ...(!!opts && opts),
  })
