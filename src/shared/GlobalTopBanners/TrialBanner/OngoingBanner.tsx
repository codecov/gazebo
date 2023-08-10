import PropTypes from 'prop-types'

import A from 'ui/A/A'
import Button from 'ui/Button/Button'
import Icon from 'ui/Icon/Icon'
import TopBanner from 'ui/TopBanner'

interface OngoingBannerProps {
  dateDiff: number
}

const OngoingBanner: React.FC<OngoingBannerProps> = ({ dateDiff }) => {
  return (
    <TopBanner localStorageKey="global-top-ongoing-trial-banner">
      <TopBanner.Start>
        <p>
          <span className="pr-2 text-xl">&#128075;</span>
          <span className="font-semibold">
            Your trial ends in {dateDiff} day(s) {/* @ts-expect-error */}
            <A to={{ pageName: 'upgradeOrgPlan' }}>upgrade</A>.
          </span>
        </p>
      </TopBanner.Start>
      <TopBanner.End>
        <p>
          {/* @ts-expect-error */}
          Need help? View our <A to={{ pageName: 'docs' }}>
            get started docs
          </A>{' '}
          or {/* @ts-expect-error */}
          see our <A to={{ pageName: 'support' }}>support</A> page.
        </p>
        <Button
          to={{ pageName: 'upgradeOrgPlan' }}
          hook="ongoing-trial-banner-to-upgrade-page"
          disabled={false}
          variant="primary"
        >
          Upgrade
        </Button>
        <TopBanner.DismissButton>
          <Icon size="sm" variant="solid" name="x" />
        </TopBanner.DismissButton>
      </TopBanner.End>
    </TopBanner>
  )
}

OngoingBanner.propTypes = {
  dateDiff: PropTypes.number.isRequired,
}

export default OngoingBanner
