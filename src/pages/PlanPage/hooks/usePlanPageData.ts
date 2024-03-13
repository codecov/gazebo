import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'

type URLParams = {
  owner: string
  provider: string
}

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

export function usePlanPageData() {
  const { owner, provider } = useParams<URLParams>()

  const variables = {
    username: owner,
  }

  return useQuery({
    queryKey: ['PlanPageData', variables, provider, query],
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
