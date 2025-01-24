import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useHistory } from 'react-router-dom'
import { z } from 'zod'

import Api from 'shared/api'

const SaveTermsAgreementInputConfig = z.object({
  businessEmail: z.string(),
  name: z.string(),
  termsAgreement: z.boolean(),
  marketingConsent: z.boolean().optional(),
})

export type SaveTermsAgreementInput = z.infer<
  typeof SaveTermsAgreementInputConfig
>

// TODO this mutation is not handling all potential union types, there is also
// unauthenticated error and validation error types that also need to be handled
// With the migration to TS Query V5, we should also actually use the zod schema
// to validate the response that is returned from the mutationFn.

const ResolverError = z.object({
  message: z.string(),
})
const _SaveTermsAgreementPayloadConfig = z.object({
  data: z.object({
    saveTermsAgreement: z.object({
      error: z.union([ResolverError, ResolverError]).nullish(),
    }),
  }),
})
export type SaveTermsAgreementPayload = z.infer<
  typeof _SaveTermsAgreementPayloadConfig
>

interface SaveTermsAgreementOptions {
  onSuccess?: (data: SaveTermsAgreementPayload) => void
  onError?: (error: Error) => void
}
export function useSaveTermsAgreement(options: SaveTermsAgreementOptions = {}) {
  const queryClient = useQueryClient()
  const history = useHistory()
  const { onSuccess, ...rest } = options

  return useMutation({
    mutationFn: (input: SaveTermsAgreementInput) => {
      const parsedInput = SaveTermsAgreementInputConfig.parse(input)

      const { businessEmail, termsAgreement, marketingConsent, name } =
        parsedInput

      const querySignAgreement = `
        mutation SigningTermsAgreement($tosInput: SaveTermsAgreementInput!) {
          saveTermsAgreement(input: $tosInput) {
            error {
              __typename
              ... on ResolverError {
                message
              }
            }
          }
        }
      `

      const variables = {
        tosInput: {
          businessEmail,
          termsAgreement,
          marketingConsent,
          name,
        },
      }
      return Api.graphqlMutation({
        mutationPath: 'saveTermsAgreement',
        query: querySignAgreement,
        variables,
        supportsServiceless: true,
      })
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['InternalUser'] })
      onSuccess && onSuccess(data)

      if (!data?.data?.saveTermsAgreement?.error) {
        history.replace('/')
      }
    },
    ...rest,
  })
}
