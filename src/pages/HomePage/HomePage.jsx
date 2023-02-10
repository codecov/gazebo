import { useHistory, useParams } from 'react-router-dom'

import MyContextSwitcher from 'layouts/MyContextSwitcher'
import LogoSpinner from 'old_ui/LogoSpinner'
import { useLocationParams } from 'services/navigation'
import { useUser } from 'services/user'
import { ActiveContext } from 'shared/context'
import ListRepo from 'shared/ListRepo'

import Tabs from './Tabs'

function HomePage() {
  const { push } = useHistory()
  const { provider } = useParams()
  const { data: currentUser, isLoading } = useUser({
    onSuccess: (data) => {
      if (!data) {
        push(`/login/${provider}`)
      }
    },
    suspense: false,
  })

  const { params } = useLocationParams({
    repoDisplay: 'All',
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center mt-16">
        <LogoSpinner />
      </div>
    )
  }

  return (
    // mt-2 until we sticky this view
    <div className="flex flex-col gap-4 mt-2">
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
