import { useLayoutEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'

import MyContextSwitcher from 'layouts/MyContextSwitcher'
import LogoSpinner from 'old_ui/LogoSpinner'
import { useSentryToken } from 'services/account'
import { useLocationParams } from 'services/navigation'
import { useUser } from 'services/user'
import { ActiveContext } from 'shared/context'
import ListRepo from 'shared/ListRepo'

import Tabs from './Tabs'

const useUserRedirect = () => {
  const { push } = useHistory()
  const { provider } = useParams()

  return useUser({
    onSuccess: (data) => {
      if (!data) {
        push(`/login/${provider}`)
      }
    },
    suspense: false,
  })
}

const useSentryTokenRedirect = () => {
  const { push } = useHistory()
  const { provider } = useParams()
  const { mutate, isLoading: isMutating } = useSentryToken({ provider })

  useLayoutEffect(() => {
    const token = localStorage.getItem('sentry-token')
    if (!!token && !isMutating) {
      mutate(token, {
        onSuccess: ({ data }) => {
          const error = data?.saveSentryState?.error
          if (!error) {
            push(`/plan/${provider}`)
          }
        },
      })
    }
  }, [isMutating, mutate, provider, push])
}

function HomePage() {
  const { params } = useLocationParams({
    repoDisplay: 'All',
  })
  const { data: currentUser, isLoading } = useUserRedirect()

  useSentryTokenRedirect()

  if (isLoading) {
    return (
      <div className="mt-16 flex items-center justify-center">
        <LogoSpinner />
      </div>
    )
  }

  return (
    // mt-2 until we sticky this view
    <div className="mt-2 flex flex-col gap-4">
      <MyContextSwitcher pageName="owner" activeContext={null} />
      <div>
        <ActiveContext.Provider value={params.repoDisplay}>
          <Tabs currentUsername={currentUser?.user?.username} />
          <ListRepo canRefetch />
        </ActiveContext.Provider>
      </div>
    </div>
  )
}

export default HomePage
