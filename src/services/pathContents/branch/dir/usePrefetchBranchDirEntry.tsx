import { useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import { RepoNotFoundErrorSchema } from 'services/repo/schemas/RepoNotFoundError'
import { RepoOwnerNotActivatedErrorSchema } from 'services/repo/schemas/RepoOwnerNotActivatedError'
import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'
import { mapEdges } from 'shared/utils/graphql'
import A from 'ui/A'

import { query } from './constants'
import {
  PathContentsResultSchema,
  RepositorySchema,
} from './schemas'

export { PathContentsResultSchema }

const BranchContentsSchema = z.object({
  owner: z
    .object({
      username: z.string().nullable(),
      repository: z.discriminatedUnion('__typename', [
        RepositorySchema,
        RepoNotFoundErrorSchema,
        RepoOwnerNotActivatedErrorSchema,
      ]),
    })
    .nullable(),
})

interface URLParams {
  provider: string
  owner: string
  repo: string
}

interface UsePrefetchBranchDirEntryArgs {
  branch: string
  path: string
  filters?: {
    searchValue?: string
    displayType?: string
    ordering?: string
    flags?: string[]
    components?: string[]
  }
}

export function usePrefetchBranchDirEntry({
  branch,
  path,
  filters,
}: UsePrefetchBranchDirEntryArgs) {
  const { provider, owner, repo } = useParams<URLParams>()
  const queryClient = useQueryClient()

  const runPrefetch = async () => {
    await queryClient.prefetchQuery({
      queryKey: [
        'BranchContents',
        provider,
        owner,
        repo,
        branch,
        path,
        filters,
      ],
      queryFn: ({ signal }) =>
        Api.graphql({
          provider,
          query,
          signal,
          variables: {
            name: owner,
            repo,
            branch,
            path,
            filters,
            first: 20,
          },
        }).then((res) => {
          const callingFn = 'usePrefetchBranchDirEntry'
          const parsedRes = BranchContentsSchema.safeParse(res?.data)

          if (!parsedRes.success) {
            return rejectNetworkError({
              errorName: 'Parsing Error',
              errorDetails: { callingFn, error: parsedRes.error },
            })
          }

          const data = parsedRes.data

          if (data?.owner?.repository?.__typename === 'NotFoundError') {
            return rejectNetworkError({
              errorName: 'Not Found Error',
              errorDetails: { callingFn },
            })
          }

          if (
            data?.owner?.repository?.__typename === 'OwnerNotActivatedError'
          ) {
            return rejectNetworkError({
              errorName: 'Owner Not Activated',
              errorDetails: { callingFn },
              data: {
                detail: (
                  <p>
                    Activation is required to view this repo, please{' '}
                    {/* @ts-expect-error - A hasn't been typed yet */}
                    <A to={{ pageName: 'membersTab' }}>click here </A> to
                    activate your account.
                  </p>
                ),
              },
            })
          }

          let results = null
          const pathContent =
            data?.owner?.repository?.branch?.head?.deprecatedPathContents

          if (
            pathContent &&
            pathContent?.__typename === 'PathContentConnection'
          ) {
            results = mapEdges({
              edges: pathContent?.edges,
            })

            return {
              results,
              pathContentsType: pathContent.__typename,
              indicationRange:
                data?.owner?.repository?.repositoryConfig?.indicationRange,
            }
          }

          return {
            results,
            pathContentsType: pathContent?.__typename,
            indicationRange:
              data?.owner?.repository?.repositoryConfig?.indicationRange,
          }
        }),
      staleTime: 10000,
    })
  }

  return { runPrefetch }
}
