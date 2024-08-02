import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'

export const RequestSchema = z
  .object({
    me: z
      .object({
        owner: z
          .object({
            isGithubRateLimited: z.boolean().nullable(),
          })
          .nullable(),
      })
      .nullable(),
  })
  .nullable()

const query = `query GetOwnerRateLimitStatus {
  me {
    owner {
     isGithubRateLimited
    }
  }
}`

interface UseOwnerRateLimitStatusArgs {
  provider: string
}

export function useOwnerRateLimitStatus({
  provider,
}: UseOwnerRateLimitStatusArgs) {
  return useQuery({
    queryKey: ['GetOwnerRateLimitStatus', provider],
    queryFn: ({ signal }) => {
      return Api.graphql({
        provider,
        signal,
        query,
      }).then((res) => {
        const parsedData = RequestSchema.safeParse(res?.data)
        if (!parsedData.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useOwnerRateLimitStatus - 404 NotFoundError',
          } satisfies NetworkErrorObject)
        }

        const data = parsedData.data
        const isGithubRateLimited = data?.me?.owner?.isGithubRateLimited
          ? true
          : false
        return {
          isGithubRateLimited,
        }
      })
    },
  })
}
