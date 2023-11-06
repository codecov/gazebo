import { useLayoutEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'

import NotFound from 'pages/NotFound'
import { useOwnerPageData } from 'pages/OwnerPage/hooks'
import { useSentryToken } from 'services/account'
import { useLocationParams } from 'services/navigation'
import { ActiveContext } from 'shared/context'
import ListRepo from 'shared/ListRepo'

import Header from './Header'
import Tabs from './Tabs'

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
