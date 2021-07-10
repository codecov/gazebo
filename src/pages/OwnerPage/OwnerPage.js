import { useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import ListRepo from 'shared/ListRepo'
import { useOwner, useUser } from 'services/user'
import NotFound from 'pages/NotFound'

import Header from './Header'

function OwnerPage({ active = false }) {
  const { owner } = useParams()
  const { data: currentUser } = useUser()
  const { data: ownerData } = useOwner({ username: owner })

  if (!ownerData) {
    return <NotFound />
  }

  return (
    <>
      <Header owner={ownerData} currentUser={currentUser} />
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
