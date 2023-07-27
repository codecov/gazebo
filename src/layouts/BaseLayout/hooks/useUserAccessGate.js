import { useParams } from 'react-router-dom'

import config from 'config'

import { useUser } from 'services/user'
import { useFlags } from 'shared/featureFlags'

// eslint-disable-next-line complexity
const useUserAccessGate = () => {
  const { provider } = useParams()
  const { termsOfServicePage } = useFlags({ termsOfServicePage: false })
  const { data, isLoading, isSuccess } = useUser({
    suspense: false,
    enabled: !!provider || !config.IS_SELF_HOSTED,
  })
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
    isFullExperience: !!config.IS_SELF_HOSTED,
    isLoading,
  }
}

export { useUserAccessGate }
