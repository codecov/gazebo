import isEqual from 'lodash/isEqual'
import isUndefined from 'lodash/isUndefined'
import { useEffect } from 'react'
import { useHistory, useParams, useRouteMatch } from 'react-router-dom'

import config from 'config'

import { useUpdateDefaultOrganization } from 'services/defaultOrganization'
import { useLocationParams } from 'services/navigation'
import { CustomerIntent, useInternalUser, useUser } from 'services/user'

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

  const {
    data: userData,
    isLoading: userIsLoading,
    isFetching: userIsFetching,
    isSuccess: userIsSuccess,
  } = useUser({
    options: {
      suspense: false,
      enabled: !!provider && !config.IS_SELF_HOSTED,
    },
  })
  const { mutate: updateDefaultOrg, isLoading: isMutationLoading } =
    useUpdateDefaultOrganization()

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

  useEffect(() => {
    if (
      userData?.user?.customerIntent === CustomerIntent.PERSONAL &&
      !userData?.owner?.defaultOrgUsername
    ) {
      updateDefaultOrg({ username: userData?.user?.username })
    }
  }, [
    userData?.user?.customerIntent,
    userData?.user?.username,
    userData?.owner?.defaultOrgUsername,
    updateDefaultOrg,
  ])

  useOnboardingRedirect({
    username: userData?.user?.username,
  })

  const foundUser = userData && userIsSuccess
  const foundInternalUser = internalUser && internalUserIsSuccess

  let showAgreeToTerms = false
  let showDefaultOrgSelector = false
  let redirectToSyncPage = false

  // the undefined provider check can be removed when the ToS has
  // been refactored to no longer use a provider
  if (foundInternalUser && !config.IS_SELF_HOSTED) {
    showAgreeToTerms = internalUser?.termsAgreement === false
  }

  const onSyncPage = currentRoute.path === '/sync'
  if (foundInternalUser && !onSyncPage) {
    // owners array contains a list of the synced providers
    // if it is zero then they haven't synced any other providers
    redirectToSyncPage = isEqual(internalUser?.owners?.length, 0)
  }

  if (
    !isUndefined(provider) &&
    foundUser &&
    !config.IS_SELF_HOSTED &&
    !isMutationLoading
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
