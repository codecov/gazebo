import { useParams } from 'react-router-dom'

import config from 'config'

import { usePlanData } from 'services/account'
import { useIsCurrentUserAnAdmin, useUser } from 'services/user'
import Sidemenu from 'ui/Sidemenu'

function defaultLinks({ internalAccessTab, viewOktaAccess }) {
  return [
    ...(viewOktaAccess ? [{ pageName: 'oktaAccess' }] : []),
    ...(internalAccessTab ? [{ pageName: internalAccessTab }] : []),
    { pageName: 'yamlTab' },
  ]
}

function selfHostedOverrideLinks({ isPersonalSettings, isAdmin }) {
  let internalAccessTab = null
  if (!config.HIDE_ACCESS_TAB && isPersonalSettings) {
    internalAccessTab = 'internalAccessTab'
  }

  return [
    { pageName: isPersonalSettings ? 'profile' : '', exact: true },
    ...(internalAccessTab ? [{ pageName: internalAccessTab }] : []),
    { pageName: 'yamlTab' },
    ...(isAdmin ? [{ pageName: 'orgUploadToken' }] : []),
  ]
}

function adminOverrideLinks({ internalAccessTab, viewOktaAccess }) {
  return [
    {
      pageName: 'accountAdmin',
      exact: true,
    },
    ...(viewOktaAccess ? [{ pageName: 'oktaAccess' }] : []),
    ...(internalAccessTab ? [{ pageName: internalAccessTab }] : []),
    { pageName: 'yamlTab' },
    { pageName: 'orgUploadToken' },
  ]
}

const generateLinks = ({ isAdmin, isPersonalSettings, viewOktaAccess }) => {
  const internalAccessTab = isPersonalSettings ? 'internalAccessTab' : ''

  if (config.IS_SELF_HOSTED) {
    return selfHostedOverrideLinks({ isPersonalSettings, isAdmin })
  }

  if (isAdmin) {
    return adminOverrideLinks({ internalAccessTab, viewOktaAccess })
  }

  return defaultLinks({ internalAccessTab, viewOktaAccess })
}

function AccountSettingsSideMenu() {
  const { provider, owner } = useParams()

  const { data: currentUser } = useUser()
  const isAdmin = useIsCurrentUserAnAdmin({ owner })

  const isPersonalSettings =
    currentUser?.user?.username?.toLowerCase() === owner?.toLowerCase()

  const { data } = usePlanData({ provider, owner })
  const viewOktaAccess = data?.plan?.isEnterprisePlan

  const links = generateLinks({
    isAdmin,
    isPersonalSettings,
    viewOktaAccess,
  })

  return <Sidemenu links={links} />
}

export default AccountSettingsSideMenu
