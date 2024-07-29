import { Redirect, useParams } from 'react-router-dom'

import config from 'config'

import { useOwner } from 'services/user'

import MemberActivation from './MembersActivation'
import MembersList from './MembersList'
import MissingMemberBanner from './MissingMemberBanner'
import Tabs from './Tabs'

function MembersPage() {
  const { owner, provider } = useParams()
  const { data: ownerData } = useOwner({ username: owner })

  if (config.IS_SELF_HOSTED) {
    return <Redirect to={`/${provider}/${owner}`} />
  }

  return (
    <div className="flex flex-col gap-4">
      {ownerData?.isCurrentUserPartOfOrg && <Tabs />}
      <h2 className="mx-4 text-lg font-semibold sm:mx-0">Manage members</h2>
      <hr className="lg:w-10/12" />
      <div className="flex flex-col gap-4 sm:mr-4 sm:flex-initial lg:w-3/5">
        <MemberActivation />
        <MissingMemberBanner />
        <MembersList />
      </div>
    </div>
  )
}

export default MembersPage
