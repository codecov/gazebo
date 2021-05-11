import PropTypes from 'prop-types'
import Spinner from 'ui/Spinner'

import { useResyncUser } from 'services/user'

function ResyncButton({ refetch }) {
  const { triggerResync, isSyncing } = useResyncUser(refetch)

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

ResyncButton.propTypes = {
  refetch: PropTypes.func.isRequired,
}

export default ResyncButton
