import isNil from 'lodash/isNil'
import { useParams } from 'react-router-dom'

import { useMyContexts } from 'services/user'

export function useOrganizations() {
  const { provider } = useParams()
  const { data: myContexts, isSuccess, ...rest } = useMyContexts({ provider })

  if (isSuccess) {
    const { currentUser, myOrganizations } = myContexts
    const orgsAndCurrentUser = [
      {
        ...currentUser,
      },
      ...myOrganizations?.map((org) => ({
        ...org,
      })),
    ]
    console.log('orgsAndCurrentUser', orgsAndCurrentUser)
    const defaultOrg = orgsAndCurrentUser?.find(
      (org) => org?.username === currentUser?.defaultOrgUsername
    )
    console.log('myOrganizations', myOrganizations)
    console.log('defaultOrg', defaultOrg)

    return {
      organizations: [
        ...(!isNil(defaultOrg) ? [{ ...defaultOrg }] : []),
        ...orgsAndCurrentUser?.filter(
          (org) => org?.username !== defaultOrg?.username
        ),
      ],
      currentUser,
      defaultOrg,
      isSuccess,
      ...rest,
    }
  }
}
