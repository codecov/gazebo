import { useParams } from 'react-router-dom'

import config from 'config'

import { useAccountDetails } from 'services/account'
import { useIsCurrentUserAnAdmin, useUser } from 'services/user'
import { useFlags } from 'shared/featureFlags'
import { isEnterprisePlan } from 'shared/utils/billing'
import Sidemenu from 'ui/Sidemenu'

function defaultLinks({ internalAccessTab, orgUploadTokenTab }) {
  return [
    ...(internalAccessTab ? [{ pageName: internalAccessTab }] : []),
    { pageName: 'yamlTab' },
    ...(orgUploadTokenTab ? [{ pageName: orgUploadTokenTab }] : []),
  ]
}

function selfHostedOverrideLinks({ isPersonalSettings }) {
  return [
    { pageName: isPersonalSettings ? 'profile' : '', exact: true },
    { pageName: 'yamlTab' },
  ]
}

function adminOverrideLinks({ internalAccessTab, orgUploadTokenTab }) {
  return [
    {
      pageName: 'accountAdmin',
      exact: true,
    },
    ...(internalAccessTab ? [{ pageName: internalAccessTab }] : []),
    { pageName: 'yamlTab' },
    ...(orgUploadTokenTab ? [{ pageName: orgUploadTokenTab }] : []),
  ]
}

const generateLinks = ({ isAdmin, isPersonalSettings, showOrgUploadToken }) => {
  const internalAccessTab = isPersonalSettings ? 'internalAccessTab' : ''
  const orgUploadTokenTab = showOrgUploadToken ? 'orgUploadToken' : ''

  if (config.IS_SELF_HOSTED) {
    return selfHostedOverrideLinks({ isPersonalSettings })
  }
  if (isAdmin) {
    return adminOverrideLinks({ internalAccessTab, orgUploadTokenTab })
  }

  return defaultLinks({ internalAccessTab, orgUploadTokenTab })
}

function AccountSettingsSideMenu() {
  const { provider, owner } = useParams()

  const { data: currentUser } = useUser()
  const isAdmin = useIsCurrentUserAnAdmin({ owner })

  const isPersonalSettings =
    currentUser?.user?.username?.toLowerCase() === owner?.toLowerCase()

  const { data: accountDetails } = useAccountDetails({ owner, provider })
  const { orgUploadToken } = useFlags({ orgUploadToken: false })
  const showOrgUploadToken =
    orgUploadToken && isEnterprisePlan(accountDetails?.plan?.value)

  const links = generateLinks({
    isAdmin,
    isPersonalSettings,
    showOrgUploadToken,
  })

  return <Sidemenu links={links} />
}

export default AccountSettingsSideMenu
