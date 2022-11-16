import { Redirect, useParams } from 'react-router-dom'

import config from 'config'

import { useOwner } from 'services/user'

import Header from './Header'
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
      <Header />
      {ownerData?.isCurrentUserPartOfOrg && <Tabs />}
      <h2 className="font-semibold text-lg">Manage members</h2>
      <hr className="w-10/12" />
      <div className="flex flex-col gap-4 sm:mr-4 sm:flex-initial w-2/3 lg:w-3/5">
        <MemberActivation />
        <MissingMemberBanner />
        <MembersList />
      </div>
    </div>
  )
}

export default MembersPage
