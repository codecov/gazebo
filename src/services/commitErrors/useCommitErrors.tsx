import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import { RepoNotFoundErrorSchema } from 'services/repo/schemas/RepoNotFoundError'
import { RepoOwnerNotActivatedErrorSchema } from 'services/repo/schemas/RepoOwnerNotActivatedError'
import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'
import { mapEdges } from 'shared/utils/graphql'
import A from 'ui/A'

interface URLParams {
  provider: string
  owner: string
  repo: string
  commit: string
}

const query = `
query CommitErrors($owner: String!, $repo: String!, $commitid: String!) {
  owner(username: $owner) {
    repository (name: $repo) {
      __typename
      ... on Repository {
        commit(id: $commitid) {
          yamlErrors: errors(errorType: YAML_ERROR){
            edges {
                node {
                    errorCode
                }
            }
          }
          botErrors: errors(errorType: BOT_ERROR){
            edges {
                node {
                    errorCode
                }
            }
          }
        }
      }
      ... on NotFoundError {
        message
      }
      ... on OwnerNotActivatedError {
        message
      }
    }
  }
}
`

const NodeSchema = z.object({
  node: z.object({ errorCode: z.string() }),
})

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  commit: z
    .object({
      yamlErrors: z
        .object({
          edges: z.array(NodeSchema.nullable()),
        })
        .nullish(),
      botErrors: z
        .object({
          edges: z.array(NodeSchema.nullable()),
        })
        .nullish(),
    })
    .nullable(),
})

const useCommitErrorsSchema = z.object({
  owner: z
    .object({
      repository: z
        .discriminatedUnion('__typename', [
          RepositorySchema,
          RepoNotFoundErrorSchema,
          RepoOwnerNotActivatedErrorSchema,
        ])
        .nullable(),
    })
    .nullable(),
})

export function useCommitErrors() {
  const { provider, owner, repo, commit: commitid } = useParams<URLParams>()

  return useQuery({
    queryKey: ['CommitErrors', provider, owner, repo, commitid],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
          repo,
          commitid,
        },
      }).then((res) => {
        const callingFn = 'useCommitErrors'
        const parsedData = useCommitErrorsSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return rejectNetworkError({
            errorName: 'Parsing Error',
            errorDetails: { callingFn, error: parsedData.error },
          })
        }

        const data = parsedData.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return rejectNetworkError({
            errorName: 'Not Found Error',
            errorDetails: { callingFn },
          })
        }

        if (data?.owner?.repository?.__typename === 'OwnerNotActivatedError') {
          return rejectNetworkError({
            errorName: 'Owner Not Activated',
            errorDetails: { callingFn },
            data: {
              detail: (
                <p>
                  Activation is required to view this repo, please{' '}
                  {/* @ts-expect-error - A hasn't been typed yet */}
                  <A to={{ pageName: 'membersTab' }}>click here </A> to activate
                  your account.
                </p>
              ),
            },
          })
        }

        return {
          yamlErrors:
            mapEdges(data?.owner?.repository?.commit?.yamlErrors) || [],
          botErrors: mapEdges(data?.owner?.repository?.commit?.botErrors) || [],
        }
      }),
  })
}
