import Spinner from 'ui/Spinner'

import { useParams } from 'react-router-dom'
import { useResyncUser } from 'services/user'
import { providerToName } from 'shared/utils/provider'
import A from 'ui/A'

function ResyncButton() {
  const { triggerResync, isSyncing } = useResyncUser()
  const { provider } = useParams()
  const isGh = providerToName(provider) === 'Github'

  return isSyncing ? (
    <div className="flex items-center text-ds-gray-senary">
      <div className="mr-2 text-ds-blue">
        <Spinner />
      </div>
      Syncing...
    </div>
  ) : (
    <div className="text-xs flex flex-col lg:text-sm">
      <p className="text-ds-gray-quinary font-semibold">
        Can’t find your repo{isGh ? ' or org?' : '?'}
      </p>
      <div className="block lg:flex lg:flex-row gap-1">
        Try{' '}
        <button className="text-ds-blue" onClick={triggerResync}>
          re-syncing
        </button>
        {isGh && (
          <div>
            {' '}
            or{' '}
            <A hook="oauth-troubleshoot" to={{ pageName: 'oauthTroubleshoot' }}>
              admin approval
            </A>{' '}
            may be required.
          </div>
        )}
      </div>
    </div>
  )
}

export default ResyncButton
