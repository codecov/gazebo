import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'
import A from 'ui/A'

// This query needs to be common between this hook and hooks that use prefetch
import {
  PathContentsRequestSchema,
  queryForCommitFile as query,
} from './constants'
import { extractCoverageFromResponse } from './utils'

// There's only 1 hook per page table as of Feb 22, 2023. This is a limitation to tailor a table to a particular page. Each "page" should have an independent set of hooks for directory and file entries. Every usePrefetchFile<page name> hook needs to this hook's query and queryKey
// There should be a coverageForFile + prefetch hook set per page. This function, due to how it's written, acts as 1 hook all pages use, and each file implements it's prefetch function accordingly. This is something that needs to be changed, likely in a subsequent PR, as we're getting rid of the individual line file type layout anyway and doing diff line only

interface UseFileWithMainCoverageArgs {
  provider: string
  owner: string
  repo: string
  ref: string
  path: string
  flags?: Array<string>
  components?: Array<string>
  opts?: {
    enabled?: boolean
    suspense?: boolean
  }
}

export function useFileWithMainCoverage({
  provider,
  owner,
  repo,
  ref,
  path,
  flags,
  components,
  opts,
}: UseFileWithMainCoverageArgs) {
  return useQuery({
    queryKey: ['commit', provider, owner, repo, ref, path, flags, components],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
          repo,
          ref,
          path,
          flags,
          components,
        },
      }).then((res) => {
        const parsedData = PathContentsRequestSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useFileWithMainCoverage - 404 schema parsing failed',
          } satisfies NetworkErrorObject)
        }

        const data = parsedData.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useFileWithMainCoverage - 404 NotFoundError',
          } satisfies NetworkErrorObject)
        }

        if (data?.owner?.repository?.__typename === 'OwnerNotActivatedError') {
          return Promise.reject({
            status: 403,
            data: {
              detail: (
                <p>
                  Activation is required to view this repo, please{' '}
                  {/* @ts-expect-error - A hasn't been typed yet*/}
                  <A to={{ pageName: 'membersTab' }}>click here </A> to activate
                  your account.
                </p>
              ),
            },
            dev: 'useFileWithMainCoverage - 403 OwnerNotActivatedError',
          } satisfies NetworkErrorObject)
        }

        return extractCoverageFromResponse(data?.owner?.repository)
      }),
    enabled: opts?.enabled,
    suspense: opts?.suspense,
  })
}
