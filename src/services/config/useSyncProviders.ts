import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'

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

interface UseSyncProvidersArgs {
  enabled?: boolean
}

export const useSyncProviders = ({ enabled = true }: UseSyncProvidersArgs) => {
  return useQuery({
    queryKey: ['GetSyncProviders'],
    queryFn: ({ signal }) => {
      return Api.graphql({
        provider: 'gh',
        signal,
        query,
      }).then((res) => {
        const parsedRes = GetSyncProvidersSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return Promise.reject({
            status: 404,
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
    enabled,
  })
}
