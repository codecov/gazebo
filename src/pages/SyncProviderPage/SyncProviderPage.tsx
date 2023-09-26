import gt from 'lodash/gt'
import { Redirect } from 'react-router-dom'

import { useInternalUser } from 'services/user/useInternalUser'
import { loginProviderToShortName } from 'shared/utils/loginProviders'

import SyncButton from './SyncButton'

function SyncProviderPage() {
  const { data: internalUser } = useInternalUser({})

  // will be false if 0 | undefined | null
  // will be true if greater than 1
  const hasSynced = gt(internalUser?.owners?.length, 0)

  // block all requests if flag is false
  // --
  // this allows us to also show the sync page within the limited
  // experience env because if they don't have any providers selected
  // then we need to have them select one before they move onto onboarding
  // --
  // once we allow users to sync multiple providers need change this logic
  // to allow them to view this page
  if (hasSynced) {
    const service = internalUser?.owners?.[0]?.service
    if (service) {
      const provider = loginProviderToShortName(service)
      return <Redirect to={`/${provider}`} />
    }

    // user **should** have a service at this point
    // but like just incase redirect them to /
    return <Redirect to="/" />
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 divide-y divide-ds-gray-secondary">
      <div>
        <h1 className="text-lg font-semibold">
          What repo provider would you like to sync?
        </h1>
        <p className="text-sm">
          You&apos;ll be taken to your repo provider to authenticate
        </p>
      </div>
      <div className="mx-auto mt-2 w-96 space-y-4 border-t border-ds-gray-secondary pt-4">
        <SyncButton provider="gh" />
        <SyncButton provider="gl" />
        <SyncButton provider="bb" />
      </div>
    </div>
  )
}

export default SyncProviderPage
