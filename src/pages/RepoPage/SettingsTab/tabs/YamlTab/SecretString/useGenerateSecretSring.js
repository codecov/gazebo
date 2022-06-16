import { useEncodeString } from 'services/repo'
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
            text: 'We were unable to generate the secret string',
          }),
      }
    )
  }

  return { generateSecretString, ...rest }
}
