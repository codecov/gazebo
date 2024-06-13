import { useUpdateRepo } from 'services/repo'

export function useRepoActivation() {
  const { mutate, ...rest } = useUpdateRepo()

  async function toggleRepoState(activated) {
    mutate({
      activated: !activated,
    })
  }

  return { toggleRepoState, ...rest }
}
