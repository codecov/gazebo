import { useEffect, useLayoutEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'


import NotFound from 'pages/NotFound'
import { useOwnerPageData } from 'pages/OwnerPage/hooks'
import { useSentryToken } from 'services/account'
import { useLocationParams } from 'services/navigation'
import { renderToast } from 'services/toast'
import { ActiveContext } from 'shared/context'
import ListRepo from 'shared/ListRepo'

import Header from './Header'
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
  const { provider } = useParams()
  const { data: ownerData } = useOwnerPageData()
  const { params } = useLocationParams({
    repoDisplay: 'All',
  })

  useSentryTokenRedirect({ ownerData })
  const userStartedTrial = localStorage.getItem(
    LOCAL_STORAGE_USER_STARTED_TRIAL_KEY
  )

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

  if (!ownerData) {
    return <NotFound />
  }

  return (
    // mt-2 temporary till we stick this header
    <div className="mt-2 flex flex-col gap-4">
      <Header />
      <div>
        {ownerData?.isCurrentUserPartOfOrg && (
          <Tabs owner={ownerData} provider={provider} />
        )}
        <ActiveContext.Provider value={params?.repoDisplay}>
          <ListRepo canRefetch={ownerData?.isCurrentUserPartOfOrg} />
        </ActiveContext.Provider>
      </div>
    </div>
  )
}

export default OwnerPage
