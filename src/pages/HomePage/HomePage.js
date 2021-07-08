import { useUser } from 'services/user'
import ListRepo from 'shared/ListRepo'

import Header from './Header'
import PropTypes from 'prop-types'

function HomePage({ active = false }) {
  const { data: currentUser } = useUser()

  return (
    <>
      <Header currentUser={currentUser} />
      <ListRepo active={active} canRefetch />
    </>
  )
}

HomePage.propTypes = {
  active: PropTypes.bool,
}

export default HomePage
