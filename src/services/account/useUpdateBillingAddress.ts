import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'

import { AddressSchema } from './useAccountDetails'

interface useUpdateBillingAddressParams {
  provider: string
  owner: string
}

export function useUpdateBillingAddress({
  provider,
  owner,
}: useUpdateBillingAddressParams) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (addressInfo: z.infer<typeof AddressSchema>) => {
      const path = `/${provider}/${owner}/account-details/update_billing_address`

      // NOTE: Hardcoded for now until we link up to address form

      const body = {
        /* eslint-disable camelcase */
        billing_address: {
          line1: '45 Fremont St.',
          line2: '',
          city: 'San Francisco',
          state: 'CA',
          country: 'US',
          postal_code: '94105',
        },
      }
      return Api.patch({ path, provider, body })
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['accountDetails', provider, owner], data)
    },
  })
}
