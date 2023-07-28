import { lazy } from 'react'
import { useRouteMatch } from 'react-router-dom'

import SilentNetworkErrorWrapper from 'layouts/shared/SilentNetworkErrorWrapper'

const SentryTrialBanner = lazy(() => import('./SentryTrialBanner'))
const RequestInstallBanner = lazy(() => import('./RequestInstallBanner'))

const GlobalTopBanners: React.FC = () => {
  const ownerMatch = useRouteMatch('/:provider/:owner')

  if (ownerMatch?.isExact) {
    return (
      <SilentNetworkErrorWrapper>
        <RequestInstallBanner />
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
