import { useEffect } from 'react'
import { useHistory, useLocation, useParams } from 'react-router-dom'

import config from 'config'

import { useLocationParams } from 'services/navigation'
import { useUser } from 'services/user'
import { useFlags } from 'shared/featureFlags'

const SetUpActions = Object.freeze({
  INSTALL: 'install',
  REQUEST: 'request',
})

function useOnboardingRedirect({ username }) {
  const history = useHistory()
  const location = useLocation()

  const { params } = useLocationParams()
  const { setup_action: setupAction } = params

  useEffect(() => {
    if (setupAction === SetUpActions.REQUEST) {
      const queryParams = new URLSearchParams(location.search)

      queryParams.set('setup_action', 'request')
      return history.push(`/gh/${username}?${queryParams.toString()}`)
    }
  }, [username, history, location.search, setupAction])
}

// eslint-disable-next-line complexity
const useUserAccessGate = () => {
  const { provider } = useParams()
  const { termsOfServicePage } = useFlags({ termsOfServicePage: false })
  const { data, isLoading, isSuccess } = useUser({
    suspense: false,
    enabled: !!provider || !config.IS_SELF_HOSTED,
  })

  useOnboardingRedirect({ username: data?.user.username })

  const isGuest = !data && isSuccess

  // If we don't have a provider, we cant check the TOS agreement, so we alow the user to access the full experience.
  if (!provider) {
    return {
      isFullExperience: true,
      isLoading: false,
    }
  }

  if (!termsOfServicePage || isGuest) {
    return {
      isFullExperience: true,
      isLoading,
    }
  }

  // Not fully tested logic yet, waiting on API to be available.
  // Assuming self hosted users do not need to sign
  return {
    isFullExperience:
      !!config.IS_SELF_HOSTED || !!data?.owner?.defaultOrgUsername,
    isLoading,
  }
}

export { useUserAccessGate }
