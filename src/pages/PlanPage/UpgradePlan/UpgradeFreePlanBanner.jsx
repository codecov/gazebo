import PropTypes from 'prop-types'

import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'

function UpgradeFreePlanBanner({ owner }) {
  return (
    <Banner>
      <BannerHeading>
        <span className="font-semibold">Updating {owner}</span>
      </BannerHeading>
      <BannerContent>
        You are choosing to upgrade {owner} to a paid plan. Please be sure this
        is the organization you wish to upgrade
      </BannerContent>
    </Banner>
  )
}

UpgradeFreePlanBanner.propTypes = {
  owner: PropTypes.string.isRequired,
}

export default UpgradeFreePlanBanner
