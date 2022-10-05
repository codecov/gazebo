import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'

function MissingMemberBanner() {
  return (
    <Banner>
      <BannerHeading>
        <h2 className="font-semibold">Don’t see a member?</h2>
      </BannerHeading>
      <BannerContent>
        <p>
          It may be because they haven’t logged into Codecov yet. Please make
          sure they log into Codecov first
        </p>
      </BannerContent>
    </Banner>
  )
}

export default MissingMemberBanner
