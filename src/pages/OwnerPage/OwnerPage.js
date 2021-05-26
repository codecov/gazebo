import { useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import ListRepo from 'shared/ListRepo'
import { useOwner } from 'services/user'
import NotFound from 'pages/NotFound'
import { useUser } from 'services/user'

import Header from './Header'

function OwnerPage({ active = false }) {
  const { data: user } = useUser({
    suspense: false,
  })

  const { owner } = useParams()
  const { data: ownerData } = useOwner({ username: owner })

  if (!ownerData) {
    return <NotFound />
  }

  return (
    <>
      <Header owner={ownerData} currentUser={user} />
      <ListRepo
        active={active}
        canRefetch={ownerData.isCurrentUserPartOfOrg}
        owner={ownerData.username}
      />
    </>
  )
}

OwnerPage.propTypes = {
  active: PropTypes.bool,
}

export default OwnerPage
