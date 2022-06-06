import { useRegenerateProfilingToken } from 'services/profilingToken'
import { useAddNotification } from 'services/toastNotification'

export default function useGenerateProfilingToken() {
  const addToast = useAddNotification()
  const { mutate, data: res, ...rest } = useRegenerateProfilingToken()

  async function regenerateToken() {
    const err = res?.data?.regenerateProfilingToken?.error
    mutate()
    if (err) {
      addToast({
        type: 'error',
        text: err,
      })
    }
  }
  return { regenerateToken, data: res?.data, ...rest }
}
