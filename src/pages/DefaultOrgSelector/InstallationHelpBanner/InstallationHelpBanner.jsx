import { useParams } from 'react-router-dom'

import { useLocationParams } from 'services/navigation'
import { useResyncUser } from 'services/user'
import { providerToName } from 'shared/utils'
import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import Icon from 'ui/Icon'
import Spinner from 'ui/Spinner'

function ResyncButton() {
  const { triggerResync, isSyncing } = useResyncUser()

  if (isSyncing) {
    return (
      <span>
        <span className="mr-1 inline-block text-ds-blue">
          <Spinner />
        </span>
        syncing...
      </span>
    )
  }

  return (
    <button className="text-ds-blue hover:underline" onClick={triggerResync}>
      re-syncing
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
    <Banner variant="top">
      <BannerContent>
        <p className="items-center gap-1 text-xs md:flex">
          <span className="flex items-center gap-1 font-semibold">
            <Icon name="information-circle" />
            Installed organization
          </span>
          - it may take a few minutes to appear as a selection, if you
          don&apos;t see it try <ResyncButton />
        </p>
      </BannerContent>
    </Banner>
  )
}

export default InstallationHelpBanner
