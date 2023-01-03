import { useParams } from 'react-router-dom'

import { useResyncUser } from 'services/user'
import { providerToName } from 'shared/utils/provider'
import A from 'ui/A'
import Spinner from 'ui/Spinner'

function ResyncButton() {
  const { triggerResync, isSyncing } = useResyncUser()
  const { provider } = useParams()
  const isGh = providerToName(provider) === 'Github'

  return isSyncing ? (
    <div className="lg:col-span-2 flex text-ds-gray-senary">
      <div className="mr-2 text-ds-blue">
        <Spinner />
      </div>
      Syncing...
    </div>
  ) : (
    <div className="lg:col-span-2 text-sm">
      <p className="text-ds-gray-quinary font-semibold">
        Can’t find your repo{isGh ? ' or org?' : '?'}
      </p>
      <div className="block lg:flex lg:flex-row gap-1 items-start flex-wrap">
        Try{' '}
        <button className="text-ds-blue flex-none" onClick={triggerResync}>
          re-syncing
        </button>
        {isGh && (
          <>
            {' '}
            or <A to={{ pageName: 'userAppManagePage' }}>check org access</A>.
            Learn more in{' '}
            <A hook="oauth-troubleshoot" to={{ pageName: 'oauthTroubleshoot' }}>
              our docs
            </A>
            .
          </>
        )}
      </div>
    </div>
  )
}

export default ResyncButton
