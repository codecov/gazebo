import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'

const RequestSchema = z.object({
  owner: z
    .object({
      orgUploadToken: z.string().nullable(),
      uploadTokenRequired: z.boolean().nullable(),
      isAdmin: z.boolean(),
    })
    .nullable(),
})

const query = `query GetUploadTokenRequired ($owner: String!) {
  owner (username: $owner) {
    orgUploadToken
    uploadTokenRequired
    isAdmin
  }
}`

interface UseUploadTokenRequiredArgs {
  provider: string
  owner: string
  enabled?: boolean
}

export const useUploadTokenRequired = ({
  provider,
  owner,
  enabled = true,
}: UseUploadTokenRequiredArgs) =>
  useQuery({
    queryKey: ['GetUploadTokenRequired', provider, owner],
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
          return Promise.reject({
            status: 404,
            data: null,
            dev: 'Failed parse for GetUploadTokenRequired',
          })
        }

        return parsedRes.data.owner
      }),
    enabled,
  })
