import { useParams } from 'react-router-dom'

import { useLocationParams } from 'services/navigation'
import { useResyncUser } from 'services/user'
import { providerToName } from 'shared/utils'
import Icon from 'ui/Icon'
import Spinner from 'ui/Spinner'
import TopBanner from 'ui/TopBanner'

function ResyncButton() {
  const { triggerResync, isSyncing } = useResyncUser()

  if (isSyncing) {
    return (
      <span>
        <span className="mr-1 inline-block text-ds-blue-default">
          <Spinner />
        </span>
        syncing...
      </span>
    )
  }

  return (
    <button
      className="text-ds-blue-default hover:underline"
      onClick={triggerResync}
      type="button"
    >
      resyncing
    </button>
  )
}

function InstallationHelpBanner() {
  const { provider } = useParams()
  const { params } = useLocationParams()

  if (providerToName(provider) !== 'Github') return null

  const { setup_action: setupAction } = params
  if (setupAction !== 'install') return null

  return (
    <TopBanner localStorageKey="install-help-banner">
      <TopBanner.Start>
        <p className="items-center gap-1 text-xs md:flex">
          <span className="flex items-center gap-1 font-semibold">
            <Icon name="information-circle" />
            Installed organization
          </span>
          - it may take a few minutes to appear as a selection, if you
          don&apos;t see it try. <ResyncButton />
        </p>
      </TopBanner.Start>
      <TopBanner.End>
        <TopBanner.DismissButton>
          <Icon size="sm" variant="solid" name="x" />
        </TopBanner.DismissButton>
      </TopBanner.End>
    </TopBanner>
  )
}

export default InstallationHelpBanner
