import { useParams } from 'react-router-dom'

import { useOwner } from 'services/user'

import Header from './Header'
import Tabs from './Tabs'

function PlanPage() {
  const { owner } = useParams()
  const { data: ownerData } = useOwner({ username: owner })

  return (
    <div className="flex flex-col gap-4">
      <Header />
      {ownerData?.isCurrentUserPartOfOrg && <Tabs />}
    </div>
  )
}

export default PlanPage
