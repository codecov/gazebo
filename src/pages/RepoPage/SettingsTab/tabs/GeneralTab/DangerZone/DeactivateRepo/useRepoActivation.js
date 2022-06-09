import { useUpdateRepo } from 'services/repo'
import { useAddNotification } from 'services/toastNotification'

export default function useRepoActivation() {
  const addToast = useAddNotification()
  const { mutate, ...rest } = useUpdateRepo()

  async function activateOrDeactivateRepo(active) {
    mutate(
      {
        active: !active,
        activated: !active,
      },
      {
        onError: () =>
          addToast({
            type: 'error',
            text: `We were not able to ${
              active ? 'deactivate' : 'activate'
            } this repo`,
          }),
      }
    )
  }

  return { activateOrDeactivateRepo, ...rest }
}
