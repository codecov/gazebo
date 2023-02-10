import { useUpdateDefaultOrganization } from 'services/defaultOrganization'
import { useAddNotification } from 'services/toastNotification'

export function useUpdateDefaultOrg() {
  const addToast = useAddNotification()
  const { mutate, ...rest } = useUpdateDefaultOrganization()

  function updateDefaultOrg({ username }) {
    mutate(
      { username },
      {
        onError: (e) => {
          return addToast({
            type: 'error',
            text: e.message,
          })
        },
      }
    )
  }

  return { updateDefaultOrg, ...rest }
}
