import { useQuery } from '@tanstack/react-queryV5'
import { z } from 'zod'

import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/helpers'

const query = `
query UnverifiedPaymentMethods($owner: String!) {
  owner(username: $owner) {
    billing {
      unverifiedPaymentMethods {
        paymentMethodId
        hostedVerificationUrl
      }
    }
  }
}
`

export const UnverifiedPaymentMethodSchema = z.object({
  paymentMethodId: z.string(),
  hostedVerificationUrl: z.string().nullish(),
})

const UnverifiedPaymentMethodsSchema = z.object({
  owner: z
    .object({
      billing: z
        .object({
          unverifiedPaymentMethods: z
            .array(UnverifiedPaymentMethodSchema)
            .nullish(),
        })
        .nullish(),
    })
    .nullish(),
})

interface UseUnverifiedPaymentMethodsArgs {
  provider: string
  owner: string
}

export const useUnverifiedPaymentMethods = ({
  provider,
  owner,
}: UseUnverifiedPaymentMethodsArgs) =>
  useQuery({
    queryKey: ['UnverifiedPaymentMethods', provider, owner],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
        },
      }).then((res) => {
        const parsedData = UnverifiedPaymentMethodsSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'useHasUnverifiedPaymentMethods - 404 failed to parse',
          })
        }

        return parsedData.data.owner?.billing?.unverifiedPaymentMethods ?? []
      }),
  })
