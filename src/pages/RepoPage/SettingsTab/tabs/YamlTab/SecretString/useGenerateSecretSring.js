import { useEncodeString } from 'services/repo'

export default function useGenerateSecretString() {
  const { mutate, ...rest } = useEncodeString()

  async function generateSecretString({ value }) {
    return mutate(value)
  }

  return { generateSecretString, ...rest }
}
