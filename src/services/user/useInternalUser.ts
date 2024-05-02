import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'

const OwnerSchema = z
  .object({
    avatarUrl: z.string(),
    integrationId: z.number().nullable(),
    name: z.string().nullable(),
    ownerid: z.number(),
    service: z.string(),
    stats: z
      .object({
        repos: z.number().nullable(),
      })
      .nullable(),
    username: z.string(),
  })
  .nullish()

export type InternalUserOwnerData = z.infer<typeof OwnerSchema>

const InternalUserSchema = z
  .object({
    email: z.string().nullable(),
    name: z.string().nullable(),
    externalId: z.string().nullable(),
    owners: z.array(OwnerSchema).nullable(),
    termsAgreement: z.boolean().nullable(),
  })
  .nullable()

export type InternalUserData = z.infer<typeof InternalUserSchema>

export interface UseInternalUserArgs {
  opts?: UseQueryOptions<InternalUserData>
}

export const useInternalUser = (opts: UseInternalUserArgs) =>
  useQuery({
    queryKey: ['InternalUser'],
    queryFn: async ({ signal }) => {
      let response
      try {
        response = await Api.get({
          path: '/user',
          signal,
        })
      } catch (e) {
        return {} as InternalUserData
      }

      const parsedData = InternalUserSchema.safeParse(response)

      if (!parsedData.success) {
        return Promise.reject({
          status: 404,
          data: null,
        })
      }

      return parsedData.data
    },
    ...(!!opts && opts),
  })
