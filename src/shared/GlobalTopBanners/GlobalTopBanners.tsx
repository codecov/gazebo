import { lazy } from 'react'
import { useRouteMatch } from 'react-router-dom'

import SilentNetworkErrorWrapper from 'layouts/shared/SilentNetworkErrorWrapper'

const SentryTrialBanner = lazy(() => import('./SentryTrialBanner'))
const InstallationHelpBanner = lazy(() => import('./InstallationHelpBanner'))
const RequestInstallBanner = lazy(() => import('./RequestInstallBanner'))

const GlobalTopBanners: React.FC = () => {
  const ownerMatch = useRouteMatch('/:provider/:owner')
  const providerMatch = useRouteMatch('/:provider')

  if (ownerMatch?.isExact) {
    return (
      <SilentNetworkErrorWrapper>
        <RequestInstallBanner />
      </SilentNetworkErrorWrapper>
    )
  }

  if (providerMatch?.isExact) {
    return (
      <SilentNetworkErrorWrapper>
        <InstallationHelpBanner />
      </SilentNetworkErrorWrapper>
    )
  }

  return (
    <SilentNetworkErrorWrapper>
      <SentryTrialBanner />
    </SilentNetworkErrorWrapper>
  )
}

export default GlobalTopBanners
