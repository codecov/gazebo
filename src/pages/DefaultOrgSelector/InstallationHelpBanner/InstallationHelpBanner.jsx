import { useParams } from 'react-router-dom'

import { useLocationParams } from 'services/navigation'
import { providerToName } from 'shared/utils'
import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import Icon from 'ui/Icon'

function InstallationHelpBanner() {
  const { provider } = useParams()
  const { params } = useLocationParams()

  if (providerToName(provider) !== 'Github') return null

  const { setup_action: setupAction } = params
  if (setupAction !== 'install') return null

  return (
    <Banner variant="top">
      <BannerContent>
        <p className="flex items-center gap-1 text-xs">
          <span className="flex items-center gap-1 font-semibold">
            <Icon name="information-circle" />
            Installed organization
          </span>
          - it may take a few minutes to appear as a selection, if you
          don&apos;t see it try re-syncing
        </p>
      </BannerContent>
    </Banner>
  )
}

export default InstallationHelpBanner
