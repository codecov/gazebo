import { useMutation, useQueryClient } from '@tanstack/react-query'

import Api from 'shared/api'

interface useUpdateBillingAddressParams {
  provider: string
  owner: string
}

interface AddressInfo {
  line1: string
  line2: string
  city: string
  state: string
  country: string
  postalCode: string
}

export function useUpdateBillingAddress({
  provider,
  owner,
}: useUpdateBillingAddressParams) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (addressInfo: AddressInfo) => {
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
      queryClient.invalidateQueries(['accountDetails'])
    },
  })
}
