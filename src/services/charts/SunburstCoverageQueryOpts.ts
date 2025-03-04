import { queryOptions as queryOptionsV5 } from '@tanstack/react-queryV5'
import { z } from 'zod'

import Api from 'shared/api'
import { Provider } from 'shared/api/helpers'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'
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

const ResponseSchema = z.array(SunburstSchema).nullable()

interface SunburstCoverageArgs {
  provider: Provider
  owner: string
  repo: string
  query?: {
    branch?: string
    flags?: string[]
    components?: string[]
  }
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
        const callingFn = 'SunburstCoverageQueryOpts'
        const parsedRes = ResponseSchema.safeParse(res)

        if (!parsedRes.success) {
          return rejectNetworkError({
            errorName: 'Parsing Error',
            errorDetails: { callingFn, error: parsedRes.error },
          })
        }

        return parsedRes.data
      })
    },
  })
}
