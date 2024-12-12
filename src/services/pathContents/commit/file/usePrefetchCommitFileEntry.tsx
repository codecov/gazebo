import { type QueryOptions, useQueryClient } from '@tanstack/react-query'
import { ParsedQs } from 'qs'
import { useParams } from 'react-router-dom'

import { extractCoverageFromResponse } from 'services/pathContents/utils'
import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'
import A from 'ui/A'

import {
  PathContentsRequestSchema,
  queryForCommitFile as query,
} from '../../constants'

interface URLParams {
  provider: string
  owner: string
  repo: string
}

interface UsePrefetchCommitFileEntryArgs {
  commitSha: string
  path: string
  flags?: Array<string> | Array<ParsedQs>
  components?: Array<string> | Array<ParsedQs>
  options?: QueryOptions
}

export function usePrefetchCommitFileEntry({
  commitSha,
  path,
  flags = [],
  components = [],
  options = {},
}: UsePrefetchCommitFileEntryArgs) {
  const { provider, owner, repo } = useParams<URLParams>()
  const queryClient = useQueryClient()

  const runPrefetch = async () => {
    await queryClient.prefetchQuery({
      queryKey: [
        'commit',
        provider,
        owner,
        repo,
        commitSha,
        path,
        flags,
        components,
      ],
      queryFn: ({ signal }) => {
        return Api.graphql({
          provider,
          query,
          signal,
          variables: {
            provider,
            owner,
            repo,
            ref: commitSha,
            path,
            flags,
            components,
          },
        }).then((res) => {
          const parsedRes = PathContentsRequestSchema.safeParse(res?.data)

          if (!parsedRes.success) {
            return Promise.reject({
              status: 404,
              data: {},
              dev: 'usePrefetchCommitFileEntry - 404 schema parsing failed',
            } satisfies NetworkErrorObject)
          }

          const data = parsedRes.data

          if (data?.owner?.repository?.__typename === 'NotFoundError') {
            return Promise.reject({
              status: 404,
              data: {},
              dev: 'usePrefetchCommitFileEntry - 404 NotFoundError',
            } satisfies NetworkErrorObject)
          }

          if (
            data?.owner?.repository?.__typename === 'OwnerNotActivatedError'
          ) {
            return Promise.reject({
              status: 403,
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
              dev: 'usePrefetchCommitFileEntry - 403 OwnerNotActivatedError',
            } satisfies NetworkErrorObject)
          }

          const coverage = extractCoverageFromResponse(data?.owner?.repository)

          if (!coverage) {
            return Promise.reject({
              status: 404,
              data: {},
              dev: 'usePrefetchCommitFileEntry - 404 failed to find coverage file',
            } satisfies NetworkErrorObject)
          }

          return coverage
        })
      },
      staleTime: 10000,
      ...(!!options && options),
    })
  }

  return { runPrefetch }
}
