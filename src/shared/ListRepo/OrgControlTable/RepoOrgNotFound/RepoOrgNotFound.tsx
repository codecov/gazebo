import { useParams } from 'react-router-dom'

import { useResyncUser } from 'services/user'
import { useOwnerRateLimitStatus } from 'services/user/useOwnerRateLimitStatus'
import A from 'ui/A'
import Spinner from 'ui/Spinner'

interface URLParams {
  provider: string
}

function ResyncButton() {
  const { triggerResync, isSyncing } = useResyncUser()
  const { provider } = useParams<URLParams>()
  const { data: rateLimit } = useOwnerRateLimitStatus({ provider })
  if (isSyncing) {
    return (
      <span>
        <span className="mr-2 inline-block text-ds-blue-default">
          <Spinner />
        </span>
        syncing...
      </span>
    )
  }

  if (rateLimit?.isGithubRateLimited) {
    return (
      <div className="inline">
        <span className="inline"> It may be due to </span>
        <A
          to={{ pageName: 'githubRateLimitExceeded' }}
          hook={undefined}
          isExternal={true}
          className="inline underline"
        >
          GitHub rate limits.
        </A>
      </div>
    )
  }

  return (
    <div className="flex">
      <button
        className="text-ds-blue-default hover:underline"
        onClick={() => triggerResync()}
      >
        Resync
      </button>
    </div>
  )
}

function RepoOrgNotFound() {
  return (
    <div className="flex items-center gap-1 text-sm">
      <span className="font-semibold text-ds-gray-quinary">
        Can&apos;t find your repo?
      </span>{' '}
      <ResyncButton />
    </div>
  )
}

export default RepoOrgNotFound
