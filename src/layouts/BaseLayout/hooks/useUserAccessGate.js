import isEqual from 'lodash/isEqual'
import isUndefined from 'lodash/isUndefined'
import { useHistory, useParams, useRouteMatch } from 'react-router-dom'

import config from 'config'

import { useUpdateDefaultOrganization } from 'services/defaultOrganization'
import { useLocationParams } from 'services/navigation'
import { useInternalUser, useUser } from 'services/user'
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
  const currentRoute = useRouteMatch()

  const { termsOfServicePage, defaultOrgSelectorPage } = useFlags({
    termsOfServicePage: false,
    defaultOrgSelectorPage: false,
  })

  const {
    data: userData,
    isLoading: userIsLoading,
    isFetching: userIsFetching,
    isSuccess: userIsSuccess,
  } = useUser({
    suspense: false,
    enabled: !!provider && !config.IS_SELF_HOSTED,
  })

  const {
    data: internalUser,
    isLoading: internalUserIsLoading,
    isFetching: internalUserIsFetching,
    isSuccess: internalUserIsSuccess,
  } = useInternalUser({
    retry: false,
    retryOnMount: false,
    suspense: false,
  })

  useOnboardingRedirect({ username: userData?.user?.username })

  const missingUser = !userData && userIsSuccess
  const missingInternalUser = !internalUser && internalUserIsSuccess
  const isGuest = missingUser || missingInternalUser

  let showAgreeToTerms = false
  let showDefaultOrgSelector = false
  let redirectToSyncPage = false

  // the undefined provider check can be removed when the ToS has
  // been refactored to no longer use a provider
  if (
    termsOfServicePage &&
    !isUndefined(provider) &&
    !isGuest &&
    !config.IS_SELF_HOSTED
  ) {
    showAgreeToTerms = userData?.termsAgreement === false
  }

  const onSyncPage = currentRoute.path === '/sync'
  if (!isGuest && !onSyncPage) {
    // owners array contains a list of the synced providers
    // if it is zero then they haven't synced any other providers
    redirectToSyncPage = isEqual(internalUser?.owners?.length, 0)
  }

  if (
    defaultOrgSelectorPage &&
    !isUndefined(provider) &&
    !isGuest &&
    !config.IS_SELF_HOSTED
  ) {
    showDefaultOrgSelector = !userData?.owner?.defaultOrgUsername
  }

  // so when a query is disabled it goes into it's loading state which will be
  // true on the /sync route, and well we don't really care about that call
  // so this just ignores that fact and only checks to see if the internal user
  // is loading rather then both ... since we won't be able to fetch both.
  let isLoading = internalUserIsLoading && internalUserIsFetching
  if (!isUndefined(provider)) {
    isLoading = (userIsLoading && userIsFetching) || isLoading
  }

  // Not fully tested logic yet, waiting on API to be available.
  return {
    isFullExperience:
      !showAgreeToTerms && !redirectToSyncPage && !showDefaultOrgSelector,
    isLoading,
    showAgreeToTerms,
    showDefaultOrgSelector,
    redirectToSyncPage,
  }
}

export { useUserAccessGate }
