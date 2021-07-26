import { useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import ListRepo from 'shared/ListRepo'
// import { useAccountDetails } from 'services/account'
import { useOwner } from 'services/user'
import NotFound from 'pages/NotFound'

import Header from './Header'

function OwnerPage({ active = false }) {
  const { owner } = useParams()
  const { data: ownerData } = useOwner({ username: owner })
  // const { data: accountDetails } = useAccountDetails({ provider, owner, opts: {
  //   useErrorBoundary: true,
  // },})

  if (!ownerData) {
    return <NotFound />
  }

  return (
    <>
      <Header owner={ownerData} />
      {/* <Header owner={ownerData} accountDetails={accountDetails} /> */}
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
