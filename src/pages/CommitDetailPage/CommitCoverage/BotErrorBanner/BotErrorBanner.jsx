import PropType from 'prop-types'
import { useParams } from 'react-router-dom'

import { useAccountDetails } from 'services/account'
import { providerToName } from 'shared/utils/provider'
import A from 'ui/A'
import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'

export const ProvidersEnum = Object.freeze({
  Github: 'GitHub',
  Gitlab: 'GitLab',
  Bitbucket: 'Bitbucket',
})

function useProviderSetting() {
  const { owner, provider: paramProvider } = useParams()
  const { data: accountDetails } = useAccountDetails({
    provider: paramProvider,
    owner,
  })

  const provider = providerToName(paramProvider)
  const ghWithApp =
    accountDetails?.integrationId && provider === ProvidersEnum.Github

  const ghWithNoApp =
    !accountDetails?.integrationId && provider === ProvidersEnum.Github

  const bbProvider = provider === ProvidersEnum.Bitbucket
  const glProvider = provider === ProvidersEnum.Gitlab

  return { ghWithNoApp, bbProvider, glProvider, ghWithApp }
}

const BotErrorContent = () => {
  const { ghWithNoApp, bbProvider, glProvider, ghWithApp } =
    useProviderSetting()
  console.log('Github')
  if (ghWithNoApp) {
    return (
      <p>
        The bot posts the coverage report comment on pull requests. If
        you&apos;re using GitHub, the best way to integrate with Codecov.io is
        to Install{' '}
        <A to={{ pageName: 'codecovGithubAppSelectTarget' }}>
          Codecov&apos;s GitHub App.
        </A>
      </p>
    )
  }
  if (glProvider) {
    return (
      <p>
        The bot posts the coverage report comment on merge request; since the
        bot is missing the report will not be visible.
      </p>
    )
  }

  if (bbProvider) {
    return (
      <p>
        The bot posts the coverage report comment on pull requests; since the
        bot is missing the report will not be visible.
      </p>
    )
  }

  if (ghWithApp) {
    return (
      <p>
        Please uninstall and reinstall the GH app to successfully sync Codecov
        with your account.
      </p>
    )
  }
}

const BotErrorHeading = () => {
  const { ghWithApp } = useProviderSetting()

  if (ghWithApp) {
    return (
      <p className="font-semibold">There was an issue with the GitHub app</p>
    )
  }

  return (
    <p className="font-semibold">
      <A to={{ pageName: 'teamBot' }}>Team bot</A> is missing
    </p>
  )
}

function BotErrorBanner({ botErrorsCount }) {
  if (botErrorsCount === 0) {
    return null
  }

  return (
    <Banner variant="warning">
      <BannerHeading>
        <BotErrorHeading />
      </BannerHeading>
      <BannerContent>
        <BotErrorContent />
      </BannerContent>
    </Banner>
  )
}

BotErrorBanner.propTypes = {
  botErrorsCount: PropType.number,
}

export default BotErrorBanner
