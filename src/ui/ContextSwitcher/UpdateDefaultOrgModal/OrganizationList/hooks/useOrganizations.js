import { useParams } from 'react-router-dom'

import { useMyContexts } from 'services/user'

export function useOrganizations() {
  const { provider } = useParams()
  const { data: myContexts } = useMyContexts({ provider })
  const { currentUser, myOrganizations } = myContexts

  return {
    organizations: [
      {
        ...currentUser,
      },
      ...myOrganizations.map((organization) => ({
        ...organization,
      })),
    ],
    currentUser,
  }
}
