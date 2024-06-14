import Spinner from 'ui/Spinner'

import { LoadingTable } from '../../subroute/ComponentsTable/ComponentsTable'

function SyncingBanner() {
  return (
    <div className="grid gap-4 pt-4">
      <LoadingTable />
      <div className="flex flex-col items-center gap-1">
        <Spinner />
        <p>It might take up to 1 hour to view your data.</p>
      </div>
    </div>
  )
}

export default SyncingBanner
