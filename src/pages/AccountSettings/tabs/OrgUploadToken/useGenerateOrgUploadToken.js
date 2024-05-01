import { useRegenerateOrgUploadToken } from 'services/orgUploadToken'
import { useAddNotification } from 'services/toastNotification'

export default function useGenerateOrgUploadToken() {
  const addToast = useAddNotification()
  const {
    mutate,
    data: res,
    ...rest
  } = useRegenerateOrgUploadToken({
    onSuccess: (data) => {
      const errString = data?.regenerateOrgUploadToken?.error?.__typename

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

  return { regenerateToken: mutate, res, ...rest }
}
