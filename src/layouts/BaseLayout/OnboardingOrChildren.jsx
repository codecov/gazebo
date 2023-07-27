import { lazy, useEffect } from 'react'
import { useHistory, useLocation } from 'react-router-dom'

import { useLocationParams } from 'services/navigation'
import { useUser } from 'services/user'

const SetUpActions = Object.freeze({
  INSTALL: 'install',
  REQUEST: 'request',
})

const InstallationHelpBanner = lazy(() =>
  import('pages/DefaultOrgSelector/InstallationHelpBanner')
)
const DefaultOrgSelector = lazy(() => import('pages/DefaultOrgSelector'))

function OnboardingOrChildren({ children }) {
  const { data: currentUser } = useUser()

  const history = useHistory()
  const location = useLocation()

  const { params } = useLocationParams()
  const { setup_action: setupAction } = params
  const defaultOrg = currentUser?.owner?.defaultOrgUsername
  const username = currentUser?.user?.username

  useEffect(() => {
    if (setupAction === SetUpActions.REQUEST) {
      const queryParams = new URLSearchParams(location.search)

      queryParams.set('setup_action', 'request')
      return history.push(`/gh/${username}?${queryParams.toString()}`)
    }
  }, [username, history, location.search, setupAction])

  if (defaultOrg) return children

  return (
    <>
      <InstallationHelpBanner />
      <DefaultOrgSelector />
    </>
  )
}

export default OnboardingOrChildren
