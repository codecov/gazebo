import { useParams, useRouteMatch } from 'react-router-dom'

import config from 'config'

import { useLocationParams } from 'services/navigation'
import { useFlags } from 'shared/featureFlags'
import { providerToName } from 'shared/utils'
import Icon from 'ui/Icon'
import TopBanner from 'ui/TopBanner'

// eslint-disable-next-line complexity
function RequestInstallBanner() {
  const { provider } = useParams()
  const { params } = useLocationParams()
  const ownerMatch = useRouteMatch('/:provider/:owner')

  const { setup_action: setupAction } = params

  const { defaultOrgSelectorPage: showBanner } = useFlags({
    defaultOrgSelectorPage: false,
  })

  if (
    !showBanner ||
    (provider && providerToName(provider) !== 'Github') ||
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
          Since you&apos;re a member of the requested organization, you need the
          owner to approve and install the app.
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
