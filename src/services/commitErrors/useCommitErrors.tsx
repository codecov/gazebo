import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo'
import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'
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
        const parsedData = useCommitErrorsSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useCommitErrors - 404 Failed to parse data',
          } satisfies NetworkErrorObject)
        }

        const data = parsedData.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useCommitErrors - 404 NotFoundError',
          } satisfies NetworkErrorObject)
        }

        if (data?.owner?.repository?.__typename === 'OwnerNotActivatedError') {
          return Promise.reject({
            status: 403,
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
            dev: 'useCommitErrors - 403 OwnerNotActivated Error',
          } satisfies NetworkErrorObject)
        }

        return {
          yamlErrors:
            mapEdges(data?.owner?.repository?.commit?.yamlErrors) || [],
          botErrors: mapEdges(data?.owner?.repository?.commit?.botErrors) || [],
        }
      }),
  })
}
