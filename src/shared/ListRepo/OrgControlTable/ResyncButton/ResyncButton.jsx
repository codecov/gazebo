import { useParams } from 'react-router-dom'

import { useResyncUser } from 'services/user'
import { providerToName } from 'shared/utils/provider'
import A from 'ui/A'
import Spinner from 'ui/Spinner'

function ResyncButton() {
  const { triggerResync, isSyncing } = useResyncUser()
  const { provider } = useParams()
  const isGh = providerToName(provider) === 'Github'

  if (isSyncing) {
    return (
      <div className="flex flex-1 items-center text-ds-gray-senary">
        <div className="mr-2 text-ds-blue">
          <Spinner />
        </div>
        Syncing...
      </div>
    )
  }

  return (
    <div className="flex-1 text-sm">
      <p className="font-semibold text-ds-gray-quinary">
        Can&apos;t find your repo{isGh ? ' or org?' : '?'}
      </p>
      <p>
        Try{' '}
        <button className="flex-none text-ds-blue" onClick={triggerResync}>
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
      </p>
    </div>
  )
}

export default ResyncButton
