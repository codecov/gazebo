import { Suspense, useEffect, useLayoutEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'

import SilentNetworkErrorWrapper from 'layouts/shared/SilentNetworkErrorWrapper'
import NotFound from 'pages/NotFound'
import { useOwnerPageData } from 'pages/OwnerPage/hooks'
import { useAccountDetails } from 'services/account/useAccountDetails'
import { useSentryToken } from 'services/account/useSentryToken'
import { useLocationParams } from 'services/navigation/useLocationParams'
import { renderToast } from 'services/toast'
import { ActiveContext } from 'shared/context'
import ListRepo from 'shared/ListRepo'

import HeaderBanners from './HeaderBanners'
import { useOnboardingContainer } from './OnboardingContainerContext/context'
import OnboardingOrg from './OnboardingOrg'
import Tabs from './Tabs'

export const LOCAL_STORAGE_USER_STARTED_TRIAL_KEY = 'user-started-trial'

const useSentryTokenRedirect = ({ ownerData }) => {
  const { push } = useHistory()
  const { provider, owner } = useParams()
  const { mutate, isLoading: isMutating } = useSentryToken({ provider })

  useLayoutEffect(() => {
    const token = localStorage.getItem('sentry-token')
    if (!!token && !isMutating && ownerData) {
      mutate(token, {
        onSuccess: (data) => {
          const error = data?.saveSentryState?.error
          if (!error) {
            push(`/plan/${provider}`)
          }
        },
      })
    }
  }, [isMutating, mutate, owner, ownerData, provider, push])
}

function OwnerPage() {
  const { owner, provider } = useParams()
  const { data: ownerData } = useOwnerPageData()
  const { params } = useLocationParams({
    repoDisplay: 'All',
  })

  useSentryTokenRedirect({ ownerData })
  const userStartedTrial = localStorage.getItem(
    LOCAL_STORAGE_USER_STARTED_TRIAL_KEY
  )

  const { showOnboardingContainer } = useOnboardingContainer()

  useEffect(() => {
    if (userStartedTrial) {
      renderToast({
        type: 'generic',
        title: '14 day trial has started',
        content: '',
        options: {
          duration: 5000,
          position: 'bottom-left',
        },
      })
      localStorage.removeItem(LOCAL_STORAGE_USER_STARTED_TRIAL_KEY)
    }
  }, [userStartedTrial])

  // TODO: refactor this to add a gql field for the integration id used to determine if the org has a GH app
  const { data: accountDetails } = useAccountDetails({
    provider,
    owner,
    opts: {
      enabled: !!ownerData?.isCurrentUserPartOfOrg,
    },
  })

  const hasGhApp = !!accountDetails?.integrationId

  if (!ownerData) {
    return <NotFound />
  }

  return (
    <div>
      <Suspense fallback={null}>
        <SilentNetworkErrorWrapper>
          <HeaderBanners />
        </SilentNetworkErrorWrapper>
      </Suspense>
      <div>
        {showOnboardingContainer ? <OnboardingOrg /> : null}
        {ownerData?.isCurrentUserPartOfOrg ? (
          <Tabs owner={ownerData} provider={provider} />
        ) : null}
        <ActiveContext.Provider value={params?.repoDisplay}>
          <ListRepo
            canRefetch={!!ownerData?.isCurrentUserPartOfOrg}
            hasGhApp={hasGhApp}
          />
        </ActiveContext.Provider>
      </div>
    </div>
  )
}

export default OwnerPage
