import { useUpdateRepo } from 'services/repo'
import { useAddNotification } from 'services/toastNotification'

export default function useRepoActivation() {
  const addToast = useAddNotification()
  const { mutate, ...rest } = useUpdateRepo()

  async function toggleRepoState(activated) {
    mutate(
      {
        activated: !activated,
      },
      {
        onError: () =>
          addToast({
            type: 'error',
            text: `We were not able to ${
              activated ? 'deactivate' : 'activate'
            } this repo`,
          }),
      }
    )
  }

  return { toggleRepoState, ...rest }
}
