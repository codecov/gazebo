import { useParams } from 'react-router-dom'

import { useOwner } from 'services/user'

import Tabs from './Tabs'

function MembersPage() {
  const { owner } = useParams()
  const { data: ownerData } = useOwner({ username: owner })

  return (
    <div className="flex flex-col gap-4">
      Members Page
      {ownerData?.isCurrentUserPartOfOrg && <Tabs />}
    </div>
  )
}

export default MembersPage
