import { useMutation, useQueryClient } from '@tanstack/react-query'
import z from 'zod'

import { useAddNotification } from 'services/toastNotification'
import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'
import A from 'ui/A'

const TOAST_DURATION = 10000

const query = `
  mutation SaveOktaConfig($input: SaveOktaConfigInput!) {
    saveOktaConfig(input: $input) {
      error {
        __typename
        ... on UnauthorizedError {
          message
          __typename
        }
        ... on ValidationError {
          message
          __typename
        }
        ... on UnauthenticatedError {
          __typename
          message
        }
      }
    }
  }
`

const ResponseSchema = z.object({
  saveOktaConfig: z
    .object({
      error: z
        .union([
          z.object({
            __typename: z.literal('UnauthorizedError'),
            message: z.string(),
          }),
          z.object({
            __typename: z.literal('ValidationError'),
            message: z.string(),
          }),
          z.object({
            __typename: z.literal('UnauthenticatedError'),
            message: z.string(),
          }),
        ])
        .nullable(),
    })
    .nullable(),
})

export const SaveOktaConfigMessage = () => (
  <p>
    Error saving Okta config.{' '}
    <A to={{ pageName: 'support' }} hook="support-link" isExternal={true}>
      Contact us
    </A>{' '}
    and we&apos;ll help you out.
  </p>
)

interface URLParams {
  provider: string
  owner: string
}

type MutationFnParams = {
  clientId?: string
  clientSecret?: string
  url?: string
  enabled?: boolean
  enforced?: boolean
}

export const useUpdateOktaConfig = ({ provider, owner }: URLParams) => {
  const addToast = useAddNotification()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      clientId,
      clientSecret,
      url,
      enabled,
      enforced,
    }: MutationFnParams) => {
      return Api.graphqlMutation({
        provider,
        query,
        variables: {
          input: {
            clientId,
            clientSecret,
            url,
            enabled,
            enforced,
            orgUsername: owner,
          },
        },
        mutationPath: 'saveOktaConfig',
      })
    },
    onSuccess: ({ data }) => {
      const parsedData = ResponseSchema.safeParse(data)
      if (!parsedData.success) {
        return Promise.reject({
          status: 404,
          data: {},
          dev: 'useUpdateOktaConfig - 404 failed to parse',
        } satisfies NetworkErrorObject)
      }

      const error = parsedData.data.saveOktaConfig?.error
      if (error) {
        if (
          error.__typename === 'ValidationError' ||
          error.__typename === 'UnauthorizedError' ||
          error.__typename === 'UnauthenticatedError'
        ) {
          addToast({
            type: 'error',
            text: <SaveOktaConfigMessage />,
            disappearAfter: TOAST_DURATION,
          })
        }
      } else {
        addToast({
          type: 'success',
          text: 'Okta configuration saved successfully!',
          disappearAfter: TOAST_DURATION,
        })
      }
    },
    onError: () => {
      addToast({
        type: 'error',
        text: <SaveOktaConfigMessage />,
        disappearAfter: TOAST_DURATION,
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries(['GetOktaConfig'])
    },
    retry: false,
  })
}
