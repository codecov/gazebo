import SilentNetworkErrorWrapper from 'layouts/shared/SilentNetworkErrorWrapper'

import BundleFeedbackBanner from './BundleFeedbackBanner'
import OktaBanners from './OktaBanners'
import ProPlanFeedbackBanner from './ProPlanFeedbackBanner'
import TeamPlanFeedbackBanner from './TeamPlanFeedbackBanner'
import TokenlessBanner from './TokenlessBanner'
import TrialBanner from './TrialBanner'

const GlobalTopBanners: React.FC = () => {
  return (
    <SilentNetworkErrorWrapper>
      <div className="[&>*:last-child]:block">
        <SilentNetworkErrorWrapper>
          <OktaBanners />
        </SilentNetworkErrorWrapper>

        <SilentNetworkErrorWrapper>
          <TrialBanner />
        </SilentNetworkErrorWrapper>

        <SilentNetworkErrorWrapper>
          <TeamPlanFeedbackBanner />
        </SilentNetworkErrorWrapper>

        <SilentNetworkErrorWrapper>
          <ProPlanFeedbackBanner />
        </SilentNetworkErrorWrapper>

        <SilentNetworkErrorWrapper>
          <BundleFeedbackBanner />
        </SilentNetworkErrorWrapper>

        <SilentNetworkErrorWrapper>
          <TokenlessBanner />
        </SilentNetworkErrorWrapper>
      </div>
    </SilentNetworkErrorWrapper>
  )
}

export default GlobalTopBanners
