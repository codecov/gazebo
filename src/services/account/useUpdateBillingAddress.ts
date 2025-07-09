import { useMutation, useQueryClient } from '@tanstack/react-query'

import Api from 'shared/api'

interface useUpdateBillingAddressParams {
  provider: string
  owner: string
}

interface useUpdateBillingAddressReturn {
  reset: () => void
  error: null | Error | BillingApiError
  isLoading: boolean
  mutate: (variables: any, data: any) => void
  data: undefined | unknown
}

interface Address {
  line1: string
  line2: string | null
  city: string
  country: string
  postal_code: string
  state: string
}

interface AddressInfo {
  name: string
  address: Address
}

export interface BillingApiError {
  data: {
    detail: string
  }
}

export function useUpdateBillingAddress({
  provider,
  owner,
}: useUpdateBillingAddressParams): useUpdateBillingAddressReturn {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (addressInfo: AddressInfo) => {
      const path = `/${provider}/${owner}/account-details/update_billing_address`

      const body = {
        /* eslint-disable camelcase */
        billing_address: addressInfo.address,
        name: addressInfo.name,
      }
      return Api.patch({ path, provider, body })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['accountDetails', provider, owner])
    },
  })
}
