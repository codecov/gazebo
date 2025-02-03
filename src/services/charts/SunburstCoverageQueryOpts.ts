import { queryOptions as queryOptionsV5 } from '@tanstack/react-queryV5'
import { z } from 'zod'

import Api from 'shared/api'
import { Provider, rejectNetworkError } from 'shared/api/helpers'
import { providerToInternalProvider } from 'shared/utils/provider'

function getSunburstCoverage({ provider, owner, repo }: SunburstCoverageArgs) {
  const internalProvider = providerToInternalProvider(provider)
  return `/${internalProvider}/${owner}/${repo}/coverage/tree`
}

const baseResponseSchema = z.object({
  name: z.string(),
  fullPath: z.string(),
  coverage: z.number(),
  lines: z.number(),
  hits: z.number(),
  partials: z.number(),
  misses: z.number(),
})

type SunburstResponse = z.infer<typeof baseResponseSchema> & {
  children?: SunburstResponse[]
}

const SunburstSchema: z.ZodType<SunburstResponse> = baseResponseSchema.extend({
  children: z.lazy(() => SunburstSchema.array()).optional(),
})

const ResponseSchema = z.array(SunburstSchema)

interface SunburstCoverageArgs {
  provider: Provider
  owner: string
  repo: string
  query?: {
    branch?: string
    flags?: string[]
    components?: string[]
  }
  signal?: AbortSignal
}

export function SunburstCoverageQueryOpts({
  provider,
  owner,
  repo,
  query,
}: SunburstCoverageArgs) {
  return queryOptionsV5({
    queryKey: ['organization', 'coverage', provider, owner, repo, query],
    queryFn: ({ signal }) => {
      const path = getSunburstCoverage({ provider, owner, repo })
      return Api.get({ path, provider, query, signal }).then((res) => {
        const parsedRes = ResponseSchema.safeParse(res)

        if (!parsedRes.success) {
          console.error(parsedRes.error)
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'SunburstCoverageQueryOpts - 404 Failed to parse data',
            error: parsedRes.error,
          })
        }

        return parsedRes.data
      })
    },
  })
}
