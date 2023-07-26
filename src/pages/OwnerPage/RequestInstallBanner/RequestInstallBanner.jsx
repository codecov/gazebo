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
  if (setupAction !== 'request') return null

  return (
    <div className="mb-8">
      <Banner variant="top">
        <BannerContent>
          <p className="flex items-center gap-1 text-xs">
            <span className="flex items-center gap-1 font-semibold">
              <Icon name="information-circle" />
              Installation request sent.
            </span>
            Since you&apos;re a member of the requested organization, you need
            the owner to approve and install the app.
          </p>
        </BannerContent>
      </Banner>
    </div>
  )
}

export default InstallationHelpBanner
