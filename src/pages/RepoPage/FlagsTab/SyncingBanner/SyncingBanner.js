import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'
import Spinner from 'ui/Spinner'

function SyncingBanner() {
  return (
    <Banner variant="plain">
      <BannerHeading>
        <div className="flex gap-2 items-center">
          <Spinner />
          <h2 className="font-semibold">Pulling historical data</h2>
        </div>
      </BannerHeading>
      <BannerContent>
        <p>
          We are pulling in all of your historical flags data, this can
          sometimes take awhile. This page will update once complete, feel free
          to navigate away in the meantime.
        </p>
      </BannerContent>
    </Banner>
  )
}

export default SyncingBanner
