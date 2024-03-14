import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'

const RequestSchema = z.object({
  owner: z
    .object({
      username: z.string().nullable(),
      isCurrentUserPartOfOrg: z.boolean(),
      numberOfUploads: z.number().nullable(),
    })
    .nullable(),
})

const query = `
  query PlanPageData($username: String!) {
    owner(username: $username) {
      username
      isCurrentUserPartOfOrg
      numberOfUploads
    }
  }
`

type UsePlanPageDataParams = {
  owner: string
  provider: string
}

export function usePlanPageData({ owner, provider }: UsePlanPageDataParams) {
  const variables = {
    username: owner,
  }

  return useQuery({
    queryKey: ['PlanPageData', variables, provider],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        variables,
        signal,
      }).then((res) => {
        const parsedRes = RequestSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'usePlanPageData - 404 schema parsing failed',
          } satisfies NetworkErrorObject)
        }

        return parsedRes.data?.owner ?? null
      }),
  })
}
