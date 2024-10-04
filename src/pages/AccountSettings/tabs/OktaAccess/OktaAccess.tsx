import { useParams } from 'react-router-dom'

import { useIsCurrentUserAnAdmin } from 'services/user'

import { AdminAuthorizationBanner } from './AdminAuthorizationBanner'
import { OktaConfigForm } from './OktaConfigForm'

interface URLParams {
  owner: string
}

function OktaAccess() {
  const { owner } = useParams<URLParams>()
  const isAdmin = useIsCurrentUserAnAdmin({ owner })

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">Okta access</h1>
        <p>
          Configure your Okta integration to enable single sign-on &#40;SSO&#41;
          for your Codecov account.
        </p>
      </div>
      <hr />
      {isAdmin ? <OktaConfigForm /> : <AdminAuthorizationBanner />}
    </div>
  )
}

export default OktaAccess
