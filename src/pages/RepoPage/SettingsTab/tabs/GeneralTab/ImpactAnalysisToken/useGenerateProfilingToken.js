import { useRegenerateRepositoryToken } from 'services/repositoryToken'
import { useAddNotification } from 'services/toastNotification'

export default function useGenerateProfilingToken() {
  const addToast = useAddNotification()
  const {
    mutate,
    data: res,
    ...rest
  } = useRegenerateRepositoryToken({ tokenType: 'PROFILING' })

  async function regenerateToken() {
    const err = res?.data?.regenerateRepositoryToken?.error
    mutate()
    if (err) {
      addToast({
        type: 'error',
        text: err,
      })
    }
  }
  return { regenerateToken, ...rest }
}
