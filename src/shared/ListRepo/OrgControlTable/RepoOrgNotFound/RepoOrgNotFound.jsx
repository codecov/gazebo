import { useParams } from 'react-router-dom'

import { useResyncUser } from 'services/user'
import { providerToName } from 'shared/utils/provider'
import A from 'ui/A'
import Spinner from 'ui/Spinner'

function ResyncButton() {
  const { triggerResync, isSyncing } = useResyncUser()

  if (isSyncing) {
    return (
      <span>
        <span className="mr-2 inline-block text-ds-blue">
          <Spinner />
        </span>
        Syncing...
      </span>
    )
  }

  return (
    <button className="text-ds-blue hover:underline" onClick={triggerResync}>
      re-syncing
    </button>
  )
}

function RepoOrgNotFound() {
  const { provider } = useParams()
  const isGh = providerToName(provider) === 'Github'

  return (
    <p className="flex-1 items-center text-sm">
      <span className="font-semibold text-ds-gray-quinary">
        Can&apos;t find your repo{isGh ? ' or org?' : '?'}
      </span>{' '}
      Try <ResyncButton />
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
  )
}

export default RepoOrgNotFound
