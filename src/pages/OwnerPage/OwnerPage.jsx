import { useParams } from 'react-router-dom'

import NotFound from 'pages/NotFound'
import { useLocationParams } from 'services/navigation'
import { useOwner } from 'services/user'
import { ActiveContext } from 'shared/context'
import ListRepo from 'shared/ListRepo'

import Header from './Header'
import Tabs from './Tabs'

function OwnerPage() {
  const { owner, provider } = useParams()
  const { data: ownerData } = useOwner({ username: owner })
  const { params } = useLocationParams({
    repoDisplay: 'All',
  })

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
        <ActiveContext.Provider value={params.repoDisplay}>
          <ListRepo
            canRefetch={ownerData.isCurrentUserPartOfOrg}
            owner={ownerData.username}
          />
        </ActiveContext.Provider>
      </div>
    </div>
  )
}

export default OwnerPage
