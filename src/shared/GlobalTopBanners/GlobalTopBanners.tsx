import { lazy } from 'react'

import SilentNetworkErrorWrapper from 'layouts/shared/SilentNetworkErrorWrapper'

const BundleFeedbackBanner = lazy(() => import('./BundleFeedbackBanner'))
const RequestInstallBanner = lazy(() => import('./RequestInstallBanner'))
const TrialBanner = lazy(() => import('./TrialBanner'))
const TeamPlanFeedbackBanner = lazy(() => import('./TeamPlanFeedbackBanner'))
const ProPlanFeedbackBanner = lazy(() => import('./ProPlanFeedbackBanner'))
const OktaBanners = lazy(() => import('./OktaBanners'))
const TokenRequiredBanner = lazy(() => import('./TokenRequiredBanner'))
const TokenNotRequiredBanner = lazy(() => import('./TokenNotRequiredBanner'))

const GlobalTopBanners: React.FC = () => {
  return (
    <SilentNetworkErrorWrapper>
      <div className="[&>*:last-child]:block">
        <OktaBanners />
        <RequestInstallBanner />
        <TrialBanner />
        <TeamPlanFeedbackBanner />
        <ProPlanFeedbackBanner />
        <BundleFeedbackBanner />
        <TokenRequiredBanner />
        <TokenNotRequiredBanner />
      </div>
    </SilentNetworkErrorWrapper>
  )
}

export default GlobalTopBanners
