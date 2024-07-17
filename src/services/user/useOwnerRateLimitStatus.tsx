import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'

export const RequestSchema = z
  .object({
    owner: z
      .object({
        isGithubRateLimited: z.boolean(),
      })
      .nullish(),
  })
  .nullish()

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
          })
        }

        const data = parsedData.data

        return {
          isGithubRateLimited: data?.owner?.isGithubRateLimited,
        }
      })
    },
  })
}
