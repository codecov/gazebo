import { useParams } from 'react-router-dom'

import config from 'config'

import { useUser } from 'services/user'
import { useFlags } from 'shared/featureFlags'

const useUserAccessGate = () => {
  const { provider } = useParams()
  const { termsOfServicePage } = useFlags({ termsOfServicePage: false })
  const { data, isLoading } = useUser({
    suspense: false,
    enabled: !!provider || !!config.IS_SELF_HOSTED,
  })

  // If we don't have a provider, we cant check the TOS agreement, so we alow the user to access the full experience.
  if (!provider) {
    return {
      isFullExperience: true,
      isLoading: false,
    }
  }

  // Not fully tested logic yet, waiting on API to be available.
  // Assuming self hosted users do not need to sign
  return {
    isFullExperience:
      !!config.IS_SELF_HOSTED ||
      !termsOfServicePage ||
      data?.termsAgreement !== false,
    isLoading,
  }
}

export { useUserAccessGate }
