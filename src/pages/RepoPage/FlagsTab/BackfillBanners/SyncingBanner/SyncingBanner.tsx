import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'
import Spinner from 'ui/Spinner'

function SyncingBanner() {
  return (
    <div className="py-4">
      <Banner variant="plain">
        <BannerHeading>
          <div className="flex items-center gap-2">
            <Spinner />
            <h2 className="font-semibold">Pulling historical data</h2>
          </div>
        </BannerHeading>
        <BannerContent>
          <p>
            We are pulling in all of your historical flags data, this will
            sometimes take a while. This page will update once data has been
            backfilled, feel free to navigate away in the meantime. For older
            data, it may take longer to populate.
          </p>
        </BannerContent>
      </Banner>
    </div>
  )
}

export default SyncingBanner
