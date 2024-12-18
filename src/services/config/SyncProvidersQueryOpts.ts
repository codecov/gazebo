import { queryOptions as queryOptionsV5 } from '@tanstack/react-queryV5'
import { z } from 'zod'

import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/helpers'

const EnterpriseSyncProvidersUnionSchema = z.union([
  z.literal('GITHUB'),
  z.literal('GITHUB_ENTERPRISE'),
  z.literal('GITLAB'),
  z.literal('GITLAB_ENTERPRISE'),
  z.literal('BITBUCKET'),
  z.literal('BITBUCKET_SERVER'),
])

export type EnterpriseSyncProviders = z.infer<
  typeof EnterpriseSyncProvidersUnionSchema
>

const GetSyncProvidersSchema = z.object({
  config: z.object({
    syncProviders: z.array(EnterpriseSyncProvidersUnionSchema),
  }),
})

const query = `
query GetSyncProviders {
  config {
    syncProviders
  }
}`

export const SyncProvidersQueryOpts = () => {
  return queryOptionsV5({
    queryKey: ['GetSyncProviders'],
    queryFn: ({ signal }) => {
      return Api.graphql({
        provider: 'gh',
        signal,
        query,
      }).then((res) => {
        const parsedRes = GetSyncProvidersSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: `SyncProvidersQueryOpts - 404 Failed to parse`,
            error: parsedRes.error,
          })
        }

        const parsedProviders = parsedRes.data.config.syncProviders
        const syncProviders: Array<'gh' | 'ghe' | 'gl' | 'gle' | 'bb' | 'bbs'> =
          []

        if (parsedProviders.includes('GITHUB')) {
          syncProviders.push('gh')
        }

        if (parsedProviders.includes('GITHUB_ENTERPRISE')) {
          syncProviders.push('ghe')
        }

        if (parsedProviders.includes('GITLAB')) {
          syncProviders.push('gl')
        }

        if (parsedProviders.includes('GITLAB_ENTERPRISE')) {
          syncProviders.push('gle')
        }

        if (parsedProviders.includes('BITBUCKET')) {
          syncProviders.push('bb')
        }

        if (parsedProviders.includes('BITBUCKET_SERVER')) {
          syncProviders.push('bbs')
        }

        return syncProviders
      })
    },
  })
}
