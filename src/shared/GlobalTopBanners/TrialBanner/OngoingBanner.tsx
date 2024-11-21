import PropTypes from 'prop-types'

import A from 'ui/A/A'
import Button from 'ui/Button/Button'
import Icon from 'ui/Icon/Icon'
import TopBanner from 'ui/TopBanner'

interface DayCountProps {
  dateDiff: number
}

const DayCount: React.FC<DayCountProps> = ({ dateDiff }) => {
  if (dateDiff <= 0) {
    return <span>Your trial ends today.</span>
  }

  if (dateDiff === 1) {
    return <span>Your trial ends in 1 day.</span>
  }

  return <span>Your trial ends in {dateDiff} days.</span>
}

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
            <DayCount dateDiff={dateDiff} />
            {/* @ts-expect-error - A hasn't been typed yet */}
            <A to={{ pageName: 'upgradeOrgPlan' }}>&nbsp;Upgrade now</A>.
          </span>
        </p>
      </TopBanner.Start>
      <TopBanner.End>
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
