import { queryOptions as queryOptionsV5 } from '@tanstack/react-queryV5'
import { z } from 'zod'

import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'

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

const GetLoginProvidersSchema = z.object({
  config: z.object({
    loginProviders: z.array(EnterpriseLoginProvidersUnionSchema),
  }),
})

const query = `
query GetLoginProviders {
  config {
    loginProviders
  }
}`

export const LoginProvidersQueryOpts = () => {
  return queryOptionsV5({
    queryKey: ['GetLoginProviders'],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider: 'gh',
        signal,
        query,
      }).then((res) => {
        const parsedRes = GetLoginProvidersSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return rejectNetworkError({
            errorName: 'Parsing Error',
            errorDetails: {
              callingFn: 'LoginProvidersQueryOpts',
              error: parsedRes.error,
            },
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
