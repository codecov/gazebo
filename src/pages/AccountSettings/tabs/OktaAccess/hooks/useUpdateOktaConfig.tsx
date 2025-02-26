import {
  useMutation as useMutationV5,
  useQueryClient as useQueryClientV5,
} from '@tanstack/react-queryV5'
import z from 'zod'

import { useAddNotification } from 'services/toastNotification/context'
import Api from 'shared/api'
import { Provider } from 'shared/api/helpers'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'
import A from 'ui/A'

import { OktaConfigQueryOpts } from '../queries/OktaConfigQueryOpts'

const TOAST_DURATION = 10000

const query = `
mutation SaveOktaConfig($input: SaveOktaConfigInput!) {
  saveOktaConfig(input: $input) {
    error {
      __typename
      ... on UnauthorizedError {
        message
      }
      ... on ValidationError {
        message
      }
      ... on UnauthenticatedError {
        message
      }
    }
  }
}`

const ErrorUnionSchema = z.discriminatedUnion('__typename', [
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

const ResponseSchema = z.object({
  saveOktaConfig: z.object({ error: ErrorUnionSchema.nullable() }).nullable(),
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
  provider: Provider
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
  const queryClientV5 = useQueryClientV5()

  return useMutationV5({
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
        return rejectNetworkError({
          errorName: 'Parsing Error',
          errorDetails: {
            callingFn: 'useUpdateOktaConfig',
            error: parsedData.error,
          },
        })
      }

      const error = parsedData.data.saveOktaConfig?.error
      if (error) {
        addToast({
          type: 'error',
          text: <SaveOktaConfigMessage />,
          disappearAfter: TOAST_DURATION,
        })
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
      queryClientV5.invalidateQueries(
        OktaConfigQueryOpts({ provider, username: owner })
      )
    },
    retry: false,
  })
}
