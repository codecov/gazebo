import PropTypes from 'prop-types'

import { useUser } from 'services/user'
import ListRepo from 'shared/ListRepo'

import Header from './Header'
import Tabs from './Tabs'

function HomePage({ active = false }) {
  const { data: currentUser } = useUser()

  return (
    <div className="flex flex-col gap-4">
      <Header />
      <div>
        <Tabs currentUsername={currentUser.username} />
        <ListRepo active={active} canRefetch />
      </div>
    </div>
  )
}

HomePage.propTypes = {
  active: PropTypes.bool,
}

export default HomePage
