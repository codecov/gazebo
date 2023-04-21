import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import Api from 'shared/api'
import { assertIsString } from 'shared/asserts'

const SaveTermsAgreementInputConfig = z.object({
  businessEmail: z.string(),
  termsAgreement: z.boolean(),
  defaultOrg: z.string().nullish().optional(),
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
  error: z.union([ResolverError, ResolverError]).nullish(),
})
export type SaveTermsAgreementPayload = z.infer<
  typeof SaveTermsAgreementPayloadConfig
>

interface Params {
  provider?: string
}
interface SaveTermsAgreementOptions {
  onSuccess?: (data: SaveTermsAgreementPayload) => void
  onError?: () => void
}
export function useSaveTermsAgreement(options: SaveTermsAgreementOptions = {}) {
  const { provider } = useParams<Params>()
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options
  return useMutation({
    mutationFn: (input: SaveTermsAgreementInput) => {
      const parsedInput = SaveTermsAgreementInputConfig.parse(input)
      assertIsString(provider)

      const { businessEmail, defaultOrg, termsAgreement } = parsedInput

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

      const queryWithDefaultOrg = `
        mutation SigningTermsAgreement($tosInput: SaveTermsAgreementInput!, $defaultOrgInput: UpdateDefaultOrganizationInput!) {
          saveTermsAgreement(input: $tosInput) {
            error {
              __typename
              ... on ResolverError {
                message
              }
            }
          }
          updateDefaultOrganization(input: $defaultOrgInput) {
            error {
              __typename
              ... on ResolverError {
                message
              }
            }
          }
        }
      `

      const tosInput = { businessEmail, termsAgreement }
      const variables = {
        tosInput,
        ...(defaultOrg && { defaultOrgInput: { username: defaultOrg } }),
      }

      return Api.graphqlMutation({
        mutationPath: 'saveTermsAgreement',
        provider,
        query: defaultOrg ? queryWithDefaultOrg : querySignAgreement,
        variables,
      })
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['currentUser', provider])
      onSuccess && onSuccess(data)
    },
    retry: 3,
    ...rest,
  })
}
