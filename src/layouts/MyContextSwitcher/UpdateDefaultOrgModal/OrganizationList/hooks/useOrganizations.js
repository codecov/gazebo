import { useParams } from 'react-router-dom'

import { useMyContexts } from 'services/user'

export function useOrganizations() {
  const { provider } = useParams()
  const { data: myContexts, isSuccess, ...rest } = useMyContexts({ provider })

  if (isSuccess) {
    const { currentUser, myOrganizations } = myContexts
    return {
      organizations: [
        {
          ...currentUser,
        },
        ...myOrganizations?.map((organization) => ({
          ...organization,
        })),
      ],
      currentUser,
      isSuccess,
      ...rest,
    }
  }
}
