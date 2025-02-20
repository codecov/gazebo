import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'

const RequestSchema = z.object({
  owner: z
    .object({
      orgUploadToken: z.string().nullable(),
    })
    .nullable(),
})

const query = `query GetOrgUploadToken ($owner: String!) {
  owner (username: $owner) {
    orgUploadToken
  }
}`

interface UseOrgUploadTokenArgs {
  provider: string
  owner: string
}

export const useOrgUploadToken = ({ provider, owner }: UseOrgUploadTokenArgs) =>
  useQuery({
    queryKey: ['GetOrgUploadToken', provider, owner],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
        },
      }).then((res) => {
        const parsedRes = RequestSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return rejectNetworkError({
            errorName: 'Parsing Error',
            errorDetails: {
              callingFn: 'useOrgUploadToken',
              error: parsedRes.error,
            },
          })
        }

        return parsedRes?.data?.owner?.orgUploadToken ?? null
      }),
  })
