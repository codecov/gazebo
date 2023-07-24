import { useParams } from 'react-router-dom'

import { providerToName } from 'shared/utils'
import A from 'ui/A'
import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'
import Icon from 'ui/Icon'

function GitHubHelpBanner() {
  const { provider } = useParams()
  if (providerToName(provider) !== 'Github') return null

  return (
    <Banner variant="plain">
      <BannerHeading>
        <div className="flex gap-1 text-sm">
          <Icon size="sm" name="light-bulb" variant="solid" />
          <h2 className="font-semibold">Don&apos;t see your org? </h2>
          <A hook="help finding an org" to={{ pageName: 'codecovGithubApp' }}>
            GitHub app is required
            <Icon name="chevronRight" size="sm" variant="solid" />
          </A>
        </div>
      </BannerHeading>
      <BannerContent>
        <div className="ml-4 mt-3 flex flex-col gap-4 text-xs font-light">
          <p>
            <span className="font-semibold">If you&apos;re an org owner</span>{' '}
            you can install app instantly.
            <br />{' '}
            <span className="font-semibold">
              If you&apos;re an org member
            </span>{' '}
            you&apos;ll need to request admin to install the app.
          </p>
          <p>
            If you installed app recently and not seeing the org you may need to
            re-sync
          </p>
        </div>
      </BannerContent>
    </Banner>
  )
}

export default GitHubHelpBanner
