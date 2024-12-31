import { useSuspenseQuery as useSuspenseQueryV5 } from '@tanstack/react-queryV5'
import PropTypes from 'prop-types'
import { Redirect } from 'react-router-dom'

import { SelfHostedCurrentUserQueryOpts } from 'services/selfHosted/SelfHostedCurrentUserQueryOpts'

import ActivationBanner from './ActivationBanner'
import AdminBanner from './AdminBanner'
import DeletionCard from './DeletionCard'
import NameEmailCard from './NameEmailCard'

function Profile({ provider, owner }) {
  const yamlTab = `/account/${provider}/${owner}/yaml/`
  const { data: currentUser } = useSuspenseQueryV5(
    SelfHostedCurrentUserQueryOpts({ provider })
  )

  const isPersonalSettings =
    currentUser?.username?.toLowerCase() === owner?.toLowerCase()

  if (!isPersonalSettings) {
    return <Redirect to={yamlTab} />
  }

  return (
    <div className="flex flex-col gap-4">
      {currentUser?.isAdmin && <AdminBanner />}
      <ActivationBanner />
      <NameEmailCard currentUser={currentUser} provider={provider} />
      <DeletionCard />
    </div>
  )
}

Profile.propTypes = {
  provider: PropTypes.string.isRequired,
  owner: PropTypes.string.isRequired,
}

export default Profile
