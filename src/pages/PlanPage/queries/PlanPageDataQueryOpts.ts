import { queryOptions as queryOptionsV5 } from '@tanstack/react-queryV5'
import { z } from 'zod'

import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/helpers'

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

type PlanPageDataQueryArgs = {
  owner: string
  provider: string
}

export function PlanPageDataQueryOpts({
  owner,
  provider,
}: PlanPageDataQueryArgs) {
  const variables = {
    username: owner,
  }

  return queryOptionsV5({
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
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'usePlanPageData - 404 schema parsing failed',
            error: parsedRes.error,
          })
        }

        return parsedRes.data?.owner ?? null
      }),
  })
}
