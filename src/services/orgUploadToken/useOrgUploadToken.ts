import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'
import { NetworkErrorObject, rejectNetworkError } from 'shared/api/helpers'

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
  enabled?: boolean
}

export const useOrgUploadToken = ({
  provider,
  owner,
  enabled = true,
}: UseOrgUploadTokenArgs) =>
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
            status: 404,
            data: {},
            dev: 'useOrgUploadToken - 404 Failed to parse data',
          } satisfies NetworkErrorObject)
        }

        return parsedRes?.data?.owner?.orgUploadToken ?? null
      }),
    enabled,
  })
