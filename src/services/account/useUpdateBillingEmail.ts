import { useMutation, useQueryClient } from '@tanstack/react-query'

import Api from 'shared/api'

interface UsePlanDataArgs {
  provider: string
  owner: string
}

interface FormDataArgs {
  newEmail: string
}

export function useUpdateBillingEmail({ provider, owner }: UsePlanDataArgs) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (formData: FormDataArgs) => {
      const path = `/${provider}/${owner}/account-details/update_email`
      const body = {
        /* eslint-disable camelcase */
        new_email: formData?.newEmail,
      }
      return Api.patch({ path, provider, body })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['accountDetails'])
    },
  })
}
