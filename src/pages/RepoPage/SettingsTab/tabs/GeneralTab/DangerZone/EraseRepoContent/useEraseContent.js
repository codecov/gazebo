import { useEraseRepoContent } from 'services/repo'
import { useAddNotification } from 'services/toastNotification'

export default function useEraseContent() {
  const addToast = useAddNotification()
  const { mutate, ...rest } = useEraseRepoContent()

  async function eraseRepoContent() {
    mutate(null, {
      onError: () =>
        addToast({
          type: 'error',
          text: "We were unable to erase this repo's content",
        }),
    })
  }

  return { eraseRepoContent, ...rest }
}
