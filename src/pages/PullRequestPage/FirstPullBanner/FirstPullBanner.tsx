import PropTypes from 'prop-types'

import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'

interface FirstPullBannerProps {
  firstPull: boolean
  state: 'OPEN' | 'CLOSED' | 'MERGED' | null
}

const FirstPullBanner: React.FC<FirstPullBannerProps> = ({
  firstPull,
  state,
}) => {
  if (!firstPull || state !== 'OPEN') {
    return null
  }

  return (
    <Banner>
      <BannerHeading>
        <h2 className="flex justify-center gap-2 font-semibold">
          Welcome to Codecov &#127881;
        </h2>
      </BannerHeading>
      <BannerContent>
        Once merged to your default branch, Codecov will compare your coverage
        reports and display the results here.
      </BannerContent>
    </Banner>
  )
}

FirstPullBanner.propTypes = {
  firstPull: PropTypes.bool.isRequired,
  state: PropTypes.oneOf(['OPEN', 'CLOSED', 'MERGED']),
}

export default FirstPullBanner
