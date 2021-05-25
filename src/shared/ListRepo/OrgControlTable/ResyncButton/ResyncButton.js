import Spinner from 'ui/Spinner'

import { useResyncUser } from 'services/user'

function ResyncButton() {
  const { triggerResync, isSyncing } = useResyncUser()

  return isSyncing ? (
    <div className="flex items-center text-ds-gray-senary">
      <div className="mr-2 text-ds-blue">
        <Spinner />
      </div>
      Syncing...
    </div>
  ) : (
    <p>
      Can’t find your repo?{' '}
      <button className="text-ds-blue" onClick={triggerResync}>
        Re-sync
      </button>
    </p>
  )
}

export default ResyncButton
