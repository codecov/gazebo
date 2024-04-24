import Spinner from 'ui/Spinner'

function SyncingBanner() {
  return (
    <div className="mt-12 grid gap-4">
      <div className="flex flex-col items-center gap-1">
        <Spinner />
        <p>It might take up to 24 hours to view your data.</p>
      </div>
    </div>
  )
}

export default SyncingBanner
