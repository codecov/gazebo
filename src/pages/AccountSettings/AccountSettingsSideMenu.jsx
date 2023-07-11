import { useParams } from 'react-router-dom'

import config from 'config'

import { useIsCurrentUserAnAdmin, useUser } from 'services/user'
import Sidemenu from 'ui/Sidemenu'

function defaultLinks({ internalAccessTab }) {
  return [
    ...(internalAccessTab ? [{ pageName: internalAccessTab }] : []),
    { pageName: 'yamlTab' },
    { pageName: 'orgUploadToken' },
  ]
}

function selfHostedOverrideLinks({ isPersonalSettings }) {
  return [
    { pageName: isPersonalSettings ? 'profile' : '', exact: true },
    { pageName: 'yamlTab' },
  ]
}

function adminOverrideLinks({ internalAccessTab }) {
  return [
    {
      pageName: 'accountAdmin',
      exact: true,
    },
    ...(internalAccessTab ? [{ pageName: internalAccessTab }] : []),
    { pageName: 'yamlTab' },
    { pageName: 'orgUploadToken' },
  ]
}

const generateLinks = ({ isAdmin, isPersonalSettings }) => {
  const internalAccessTab = isPersonalSettings ? 'internalAccessTab' : ''

  if (config.IS_SELF_HOSTED) {
    return selfHostedOverrideLinks({ isPersonalSettings })
  }

  if (isAdmin) {
    return adminOverrideLinks({ internalAccessTab })
  }

  return defaultLinks({ internalAccessTab })
}

function AccountSettingsSideMenu() {
  const { owner } = useParams()

  const { data: currentUser } = useUser()
  const isAdmin = useIsCurrentUserAnAdmin({ owner })

  const isPersonalSettings =
    currentUser?.user?.username?.toLowerCase() === owner?.toLowerCase()

  const links = generateLinks({
    isAdmin,
    isPersonalSettings,
  })

  return <Sidemenu links={links} />
}

export default AccountSettingsSideMenu
