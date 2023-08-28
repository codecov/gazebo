import { useHistory, useParams, useRouteMatch } from 'react-router-dom'

import config from 'config'

import { useUpdateDefaultOrganization } from 'services/defaultOrganization'
import { useLocationParams } from 'services/navigation'
import { useUser } from 'services/user'
import { useFlags } from 'shared/featureFlags'

const SetUpActions = Object.freeze({
  INSTALL: 'install',
  REQUEST: 'request',
})

function useOnboardingRedirect({ username }) {
  const history = useHistory()
  const matchProvider = useRouteMatch('/gh')
  const { params } = useLocationParams()
  const { mutate: updateDefaultOrg } = useUpdateDefaultOrganization()

  if (!username) return

  const { setup_action: setupAction } = params

  if (setupAction === SetUpActions.REQUEST && matchProvider.isExact) {
    updateDefaultOrg({ username })

    return history.push(`/gh/${username}?setup_action=${SetUpActions.REQUEST}`)
  }
}

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
