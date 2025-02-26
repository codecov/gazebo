import { useUpdateRepo } from 'services/repo'
import { useAddNotification } from 'services/toastNotification/context'

export function useRepoActivation() {
  const addToast = useAddNotification()
  const { mutate, ...rest } = useUpdateRepo()

  async function toggleRepoState(activated) {
    const status = activated ? 'deactivate' : 'activate'

    mutate(
      {
        activated: !activated,
      },
      {
        onError: () =>
          addToast({
            type: 'error',
            text: `We were not able to ${status} this repo`,
          }),
      }
    )
  }

  return { toggleRepoState, ...rest }
}
