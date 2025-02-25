import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'

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
        const callingFn = 'useOwnerRateLimitStatus'
        const parsedData = RequestSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return rejectNetworkError({
            errorName: 'Parsing Error',
            errorDetails: { callingFn, error: parsedData.error },
          })
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
