import { useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import ListRepo from 'shared/ListRepo'
import { useOwner } from 'services/user'
import NotFound from 'pages/NotFound'

import Header from './Header'
import Tabs from './Tabs'
import { ActiveContext } from 'shared/context'

function OwnerPage({ active = false }) {
  const { owner, provider } = useParams()
  const { data: ownerData } = useOwner({ username: owner })

  if (!ownerData) {
    return <NotFound />
  }

  return (
    <div className="flex flex-col gap-4">
      <Header owner={ownerData} provider={provider} />
      <div>
        {ownerData?.isCurrentUserPartOfOrg && (
          <Tabs owner={ownerData} provider={provider} />
        )}
        <ActiveContext.Provider value={active}>
          <ListRepo
            canRefetch={ownerData.isCurrentUserPartOfOrg}
            owner={ownerData.username}
          />
        </ActiveContext.Provider>
      </div>
    </div>
  )
}

OwnerPage.propTypes = {
  active: PropTypes.bool,
}

export default OwnerPage
