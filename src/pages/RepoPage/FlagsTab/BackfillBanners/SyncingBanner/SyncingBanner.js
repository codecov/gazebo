import Banner from 'ui/Banner'
import Spinner from 'ui/Spinner'

function SyncingBanner() {
  return (
    <div className="py-4">
      <Banner
        variant="plain"
        heading={
          <div className="flex gap-2 items-center">
            <Spinner />
            <h2 className="font-semibold">Pulling historical data</h2>
          </div>
        }
      >
        We are pulling in all of your historical flags data, this will sometimes
        take a while. This page will update once data has been backfilled, feel
        free to navigate away in the meantime. For older data, it may take
        longer to populate.
      </Banner>
    </div>
  )
}

export default SyncingBanner
