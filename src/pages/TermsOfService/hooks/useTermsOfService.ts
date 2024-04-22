import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'

const SaveTermsAgreementInputConfig = z.object({
  businessEmail: z.string().nullable().optional(),
  termsAgreement: z.boolean(),
  marketingConsent: z.boolean().optional(),
  customerIntent: z.string(),
})

export type SaveTermsAgreementInput = z.infer<
  typeof SaveTermsAgreementInputConfig
>

// TODO need to figure out where/how to share api resolver error type and to reflect the graphql schema. Maybe do resolver level schema validation in shared?
// Lets discuss this as we migrate more of the api to typescript.
const ResolverError = z.object({
  message: z.string(),
})
const SaveTermsAgreementPayloadConfig = z.object({
  data: z.object({
    saveTermsAgreement: z.object({
      error: z.union([ResolverError, ResolverError]).nullish(),
    }),
  }),
})
export type SaveTermsAgreementPayload = z.infer<
  typeof SaveTermsAgreementPayloadConfig
>

interface SaveTermsAgreementOptions {
  onSuccess?: (data: SaveTermsAgreementPayload) => void
  onError?: (error: Error) => void
}
export function useSaveTermsAgreement(options: SaveTermsAgreementOptions = {}) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options
  return useMutation({
    mutationFn: (input: SaveTermsAgreementInput) => {
      const parsedInput = SaveTermsAgreementInputConfig.parse(input)

      const {
        businessEmail,
        termsAgreement,
        marketingConsent,
        customerIntent,
      } = parsedInput

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
          customerIntent,
        },
      }
      return Api.graphqlMutation({
        mutationPath: 'saveTermsAgreement',
        query: querySignAgreement,
        variables,
      })
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['InternalUser'] })
      onSuccess && onSuccess(data)
    },
    ...rest,
  })
}
