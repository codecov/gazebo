import { useRegenerateOrgUploadToken } from 'services/orgUploadToken'
import { useAddNotification } from 'services/toastNotification'

export default function useGenerateOrgUploadToken() {
  const addToast = useAddNotification()
  const { mutate, data: res, ...rest } = useRegenerateOrgUploadToken()

  async function regenerateToken() {
    const err = res?.data?.regenerateOrgUploadToken?.error

    mutate()
    if (err) {
      addToast({
        type: 'error',
        text: err,
      })
    } else {
      addToast({
        type: 'success',
        text: 'Global repository upload token generated.',
      })
    }
  }
  return { regenerateToken, res, ...rest }
}
