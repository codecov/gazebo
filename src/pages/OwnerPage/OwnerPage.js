import { useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import ListRepo from 'shared/ListRepo'
import { useOwner } from 'services/user'
import NotFound from 'pages/NotFound'

import Header from './Header'

function HomePage({ active = false }) {
  const { owner } = useParams()
  const { data: ownerData } = useOwner({ username: owner })

  if (!ownerData) {
    return <NotFound />
  }

  return (
    <>
      <Header owner={owner} />
      <ListRepo active={active} owner={ownerData.username} />
    </>
  )
}

HomePage.propTypes = {
  active: PropTypes.bool,
}

export default HomePage
