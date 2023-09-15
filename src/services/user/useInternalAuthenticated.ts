import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'

const InternalAuthenticatedSchema = z
  .object({
    authenticated: z.boolean(),
  })
  .nullish()

export type InternalAuthenticatedData = z.infer<
  typeof InternalAuthenticatedSchema
>

export interface UseInternalAuthenticatedArgs {
  opts?: UseQueryOptions<InternalAuthenticatedData>
}

export const useInternalAuthenticated = (opts: UseInternalAuthenticatedArgs) =>
  useQuery({
    queryKey: ['InternalAuthenticated'],
    queryFn: ({ signal }) => {
      return Api.get({
        path: '/authenticated',
        signal,
      }).then((res) => InternalAuthenticatedSchema.parse(res))
    },
    ...(!!opts && opts),
  })
