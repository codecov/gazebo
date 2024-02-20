import { useResyncUser } from 'services/user'
import Spinner from 'ui/Spinner'

function ResyncButton() {
  const { triggerResync, isSyncing } = useResyncUser()

  if (isSyncing) {
    return (
      <span>
        <span className="mr-2 inline-block text-ds-blue">
          <Spinner />
        </span>
        syncing...
      </span>
    )
  }

  return (
    <button className="text-ds-blue hover:underline" onClick={triggerResync}>
      Resync
    </button>
  )
}

function RepoOrgNotFound() {
  return (
    <p className="flex-1 items-center text-sm">
      <span className="font-semibold text-ds-gray-quinary">
        Can&apos;t find your repo?
      </span>{' '}
      <ResyncButton />
    </p>
  )
}

export default RepoOrgNotFound
