import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'

const EnterpriseLoginProvidersUnionSchema = z.union([
  z.literal('GITHUB'),
  z.literal('GITHUB_ENTERPRISE'),
  z.literal('GITLAB'),
  z.literal('GITLAB_ENTERPRISE'),
  z.literal('BITBUCKET'),
  z.literal('BITBUCKET_SERVER'),
  z.literal('OKTA'),
])

export type EnterpriseLoginProviders = z.infer<
  typeof EnterpriseLoginProvidersUnionSchema
>

const GetServiceProvidersSchema = z.object({
  config: z.object({
    loginProviders: z.array(EnterpriseLoginProvidersUnionSchema),
  }),
})

const query = `
query GetServiceProviders {
  config {
    loginProviders
  }
}`

export const useServiceProviders = () => {
  return useQuery({
    queryKey: ['GetServiceProviders'],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider: 'gh',
        signal,
        query,
      }).then((res) => {
        const parsedRes = GetServiceProvidersSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return Promise.reject({
            status: 404,
          })
        }

        const loginProviders = parsedRes.data.config.loginProviders

        const github = loginProviders.some(
          (value) => value === 'GITHUB' || value === 'GITHUB_ENTERPRISE'
        )

        const gitlab = loginProviders.some(
          (value) => value === 'GITLAB' || value === 'GITLAB_ENTERPRISE'
        )

        const bitbucket = loginProviders.some(
          (value) => value === 'BITBUCKET' || value === 'BITBUCKET_SERVER'
        )

        const okta = loginProviders.some((value) => value === 'OKTA')

        return {
          providerList: loginProviders,
          github,
          gitlab,
          bitbucket,
          okta,
        }
      }),
  })
}
