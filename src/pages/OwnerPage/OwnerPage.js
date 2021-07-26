import { useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import ListRepo from 'shared/ListRepo'
import { useAccountDetails } from 'services/account'
import { useOwner } from 'services/user'
import NotFound from 'pages/NotFound'

import Header from './Header'

function OwnerPage({ active = false }) {
  const { owner, provider } = useParams()
  const { data: ownerData } = useOwner({ username: owner })
  const { data: accountDetails } = useAccountDetails({ provider, owner })

  if (!ownerData) {
    return <NotFound />
  }

  return (
    <>
      <Header owner={ownerData} accountDetails={accountDetails} />
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
