import { useHistory, useParams } from 'react-router'
import PropTypes from 'prop-types'

import LogoSpinner from 'old_ui/LogoSpinner'
import { useUser } from 'services/user'
import ListRepo from 'shared/ListRepo'

import Header from './Header'
import Tabs from './Tabs'
import ExampleFlag from './ExampleFlag'

function HomePage({ active = false }) {
  const { push } = useHistory()
  const { provider } = useParams()
  const { data: currentUser, isLoading } = useUser({
    onError: (data) => push(`/login/${provider}`),
    suspense: false,
  })

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center mt-16">
        <LogoSpinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Header />
      <div>
        <Tabs currentUsername={currentUser.user.username} />
        <ListRepo active={active} canRefetch />
        <ExampleFlag provider={provider} />
      </div>
    </div>
  )
}

HomePage.propTypes = {
  active: PropTypes.bool,
}

export default HomePage
