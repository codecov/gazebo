import { useParams, useRouteMatch } from 'react-router-dom'

import config from 'config'

import { useLocationParams } from 'services/navigation'
import { providerToName } from 'shared/utils'
import Icon from 'ui/Icon'
import TopBanner from 'ui/TopBanner'

function RequestInstallBanner() {
  const { provider } = useParams()
  const { params } = useLocationParams()
  const ownerMatch = useRouteMatch('/:provider/:owner')

  const { setup_action: setupAction } = params

  const isGitHubProvider = provider && providerToName(provider) === 'Github'

  if (
    !isGitHubProvider ||
    !ownerMatch?.isExact ||
    setupAction !== 'request' ||
    config.IS_SELF_HOSTED
  )
    return null

  return (
    <TopBanner localStorageKey="request-install-banner">
      <TopBanner.Start>
        <p className="flex items-center gap-1 text-xs">
          <span className="flex items-center gap-1 font-semibold">
            <Icon name="information-circle" />
            Installation request sent.
          </span>
          You need GitHub Admin approval to install the app. We bugged them for
          you. You should too.
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

export default RequestInstallBanner
