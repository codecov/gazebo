import PropType from 'prop-types'
import { useParams } from 'react-router-dom'

import { useAccountDetails } from 'services/account'
import { providerToName } from 'shared/utils'
import A from 'ui/A'
import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'

export const ProvidersEnum = Object.freeze({
  Github: 'Github',
  Gitlab: 'Gitlab',
  BitBucket: 'BitBucket',
})

function useProviderSetting() {
  const { owner, provider: paramProvider } = useParams()
  const { data: accountDetails } = useAccountDetails({
    provider: paramProvider,
    owner,
  })

  const provider = providerToName(paramProvider)
  const hasGhApp = accountDetails?.integrationId

  const ghWithNoApp = provider === ProvidersEnum.Github && !hasGhApp
  const bbOrhasGhApp =
    provider === ProvidersEnum.BitBucket ||
    (hasGhApp && provider === ProvidersEnum.Github)
  const glProvider = provider === ProvidersEnum.Gitlab

  return { ghWithNoApp, bbOrhasGhApp, glProvider }
}

function BotErrorBanner({ botErrorsCount }) {
  const { ghWithNoApp, bbOrhasGhApp, glProvider } = useProviderSetting()

  if (botErrorsCount === 0) {
    return null
  }

  return (
    <Banner variant="warning">
      <BannerHeading>
        <p className="font-semibold">
          <A to={{ pageName: 'teamBot' }}>Team bot </A> is missing
        </p>
      </BannerHeading>
      <BannerContent>
        {ghWithNoApp && (
          <div className="lg:flex lg:w-max gap-1">
            <span>
              The bot posts the coverage report comment on pull requests. If
              you&apos;re using GitHub, the best way to integrate with
              Codecov.io is to Install
            </span>
            <A to={{ pageName: 'codecovGithubApp' }}>
              {' '}
              Codecov&apos;s GitHub App.
            </A>{' '}
          </div>
        )}
        {glProvider && (
          <p>
            The bot posts the coverage report comment on merge request; since
            the bot is missing the report will not be visible.
          </p>
        )}
        {bbOrhasGhApp && (
          <p>
            The bot posts the coverage report comment on pull requests; since
            the bot is missing the report will not be visible.
          </p>
        )}
      </BannerContent>
    </Banner>
  )
}

BotErrorBanner.propTypes = {
  botErrorsCount: PropType.number,
}

export default BotErrorBanner
