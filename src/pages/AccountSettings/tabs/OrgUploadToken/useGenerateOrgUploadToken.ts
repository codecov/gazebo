import { useRegenerateOrgUploadToken } from 'services/orgUploadToken'
import { useAddNotification } from 'services/toastNotification'

export default function useGenerateOrgUploadToken() {
  const addToast = useAddNotification()
  const {
    mutate,
    mutateAsync,
    data: res,
    ...rest
  } = useRegenerateOrgUploadToken({
    onSuccess: (result) => {
      const errString = result?.error?.__typename

      if (errString) {
        addToast({
          type: 'error',
          text: errString,
        })
      } else {
        addToast({
          type: 'success',
          text: 'Global upload token generated.',
        })
      }
    },
  })

  return {
    regenerateToken: mutate,
    regenerateTokenAsync: mutateAsync,
    res,
    ...rest,
  }
}
