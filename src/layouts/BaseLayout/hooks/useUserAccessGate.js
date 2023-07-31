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

// eslint-disable-next-line complexity, max-statements
const useUserAccessGate = () => {
  const { provider } = useParams()
  const { termsOfServicePage, defaultOrgSelectorPage } = useFlags({
    termsOfServicePage: false,
    defaultOrgSelectorPage: false,
  })
  const { data, isLoading, isSuccess } = useUser({
    suspense: false,
    enabled: !!provider || !config.IS_SELF_HOSTED,
  })

  useOnboardingRedirect({ username: data?.user.username })

  const isGuest = !data && isSuccess
  let showAgreeToTerms = false,
    showDefaultOrgSelector = false

  // If we don't have a provider, we cant check the TOS agreement, so we alow the user to access the full experience.
  if (!provider) {
    return {
      isFullExperience: true,
      isLoading: false,
      showAgreeToTerms,
      showDefaultOrgSelector,
    }
  }

  if (termsOfServicePage && !isGuest) {
    showAgreeToTerms = data?.termsAgreement === false
  }

  if (defaultOrgSelectorPage && !isGuest) {
    showDefaultOrgSelector = !!data?.owner?.defaultOrgUsername
  }

  // Not fully tested logic yet, waiting on API to be available.
  // Assuming self hosted users do not need to sign
  return {
    isFullExperience:
      !!config.IS_SELF_HOSTED || (!showAgreeToTerms && !showDefaultOrgSelector),
    isLoading,
    showAgreeToTerms,
    showDefaultOrgSelector,
  }
}

export { useUserAccessGate }
