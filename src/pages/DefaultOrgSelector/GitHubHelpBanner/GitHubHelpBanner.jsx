import { useParams } from 'react-router-dom'

import { useResyncUser } from 'services/user'
import { providerToName } from 'shared/utils'
import A from 'ui/A'
import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'
import Icon from 'ui/Icon'
import Spinner from 'ui/Spinner'

function ResyncButton() {
  const { triggerResync, isSyncing } = useResyncUser()

  if (isSyncing) {
    return (
      <span className="flex items-center gap-1">
        <span className="text-ds-blue">
          <Spinner />
        </span>
        syncing...
      </span>
    )
  }

  return (
    <button
      className="text-ds-blue hover:underline"
      onClick={triggerResync}
      type="button"
    >
      Re-sync now.
    </button>
  )
}

function GitHubHelpBanner() {
  const { provider } = useParams()
  if (providerToName(provider) !== 'Github') return null

  return (
    <Banner variant="plain">
      <BannerHeading>
        <div className="flex gap-1 text-sm">
          <Icon size="sm" name="lightBulb" variant="solid" />
          <h2 className="font-semibold">Don&apos;t see your organization? </h2>
          <A hook="help finding an org" to={{ pageName: 'codecovGithubApp' }}>
            Install the Codecov GitHub App.
            <Icon name="chevronRight" size="sm" variant="solid" />
          </A>
        </div>
      </BannerHeading>
      <BannerContent>
        <div className="ml-4 mt-3 flex flex-col gap-4 text-xs font-light">
          <p>
            <span className="font-semibold">
              Please note, GitHub organization members will need to request
              admin approval to install the Codecov app.
            </span>
          </p>
          <p>
            If you installed the app recently and are not seeing your
            organizations, you may need to re-sync your repositories.{' '}
            <ResyncButton />
          </p>
        </div>
      </BannerContent>
    </Banner>
  )
}

export default GitHubHelpBanner
