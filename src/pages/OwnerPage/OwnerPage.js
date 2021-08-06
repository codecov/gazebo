import { useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import ListRepo from 'shared/ListRepo'
import { useOwner } from 'services/user'
import NotFound from 'pages/NotFound'

import Header from './Header'
import Tabs from './Tabs'

function OwnerPage({ active = false }) {
  const { owner } = useParams()
  const { data: ownerData } = useOwner({ username: owner })

  if (!ownerData) {
    return <NotFound />
  }

  return (
    <div className="flex flex-col gap-4">
      <Header owner={ownerData} />
      <div>
        {ownerData?.isCurrentUserPartOfOrg && <Tabs owner={ownerData} />}
        <ListRepo
          active={active}
          canRefetch={ownerData.isCurrentUserPartOfOrg}
          owner={ownerData.username}
        />
      </div>
    </div>
  )
}

OwnerPage.propTypes = {
  active: PropTypes.bool,
}

export default OwnerPage
