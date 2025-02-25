import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'

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
      } catch (_e) {
        return {} as InternalUserData
      }

      const callingFn = 'useInternalUser'
      const parsedData = InternalUserSchema.safeParse(response)

      if (!parsedData.success) {
        return rejectNetworkError({
          errorName: 'Parsing Error',
          errorDetails: { callingFn, error: parsedData.error },
        })
      }

      return parsedData.data
    },
    ...(!!opts && opts),
  })
