import { useParams } from 'react-router-dom'

import config from 'config'

import { useUser } from 'services/user'
import { useFlags } from 'shared/featureFlags'

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
    showDefaultOrgSelector = !data?.owner?.defaultOrgUsername
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
