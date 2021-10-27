import { useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import ListRepo from 'shared/ListRepo'
import { useOwner } from 'services/user'
import NotFound from 'pages/NotFound'
import { usePulls } from 'services/pulls'

import Header from './Header'
import Tabs from './Tabs'

function OwnerPage({ active = false }) {
  const { owner, provider } = useParams()
  const { data: ownerData } = useOwner({ username: owner })
  const { data: pulls } = usePulls({ provider, owner, repo: 'gazebo' })
  console.log(pulls)

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
