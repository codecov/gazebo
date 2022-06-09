import { useEncodeString } from 'services/repo/useEncodeString'
import { useAddNotification } from 'services/toastNotification'

export default function useGenerateSecretString() {
  const addToast = useAddNotification()
  const { mutate, ...rest } = useEncodeString()

  async function generateSecretString({ value }) {
    mutate(
      { value },
      {
        onError: () =>
          addToast({
            type: 'error',
            text: 'Something went wrong',
          }),
      }
    )
  }

  return { generateSecretString, ...rest }
}
