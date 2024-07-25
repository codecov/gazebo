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
        Syncing your organizations...
      </span>
    )
  }

  return (
    <span className="flex gap-1">
      <button
        className="text-ds-blue hover:underline"
        onClick={() => triggerResync()}
        type="button"
      >
        Resync
      </button>
      to refresh your organizations.
    </span>
  )
}

function GitHubHelpBanner() {
  const { provider } = useParams<{ provider: string }>()
  if (providerToName(provider) !== 'Github') return null

  return (
    <Banner variant="plain">
      <BannerHeading>
        <div className="flex gap-1 text-sm">
          <Icon size="sm" name="lightBulb" variant="solid" />
          <h2 className="font-semibold">Don&apos;t see your organization? </h2>
          <A
            hook="help finding an org"
            to={{ pageName: 'codecovGithubAppSelectTarget' }}
            isExternal={true}
          >
            GitHub App is required
            <Icon name="chevronRight" size="sm" variant="solid" />
          </A>
        </div>
      </BannerHeading>
      <BannerContent>
        <div className="ml-4 flex flex-col gap-6 text-xs font-light">
          <p>You&apos;ll need the organization admin to install the app.</p>
          <ResyncButton />
        </div>
      </BannerContent>
    </Banner>
  )
}

export default GitHubHelpBanner
