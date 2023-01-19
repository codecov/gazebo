import { useParams } from 'react-router-dom'

import { useCommit } from 'services/commit'
import { getProviderCommitURL, getProviderPullURL } from 'shared/utils'
import { formatTimeToNow } from 'shared/utils/dates'
import A from 'ui/A'
import CIStatusLabel from 'ui/CIStatus'
import Icon from 'ui/Icon'

import PullLabel from './PullLabel'
import TruncatedMessage from './TruncatedMessage'

function Header() {
  const { provider, owner, repo, commit: commitSHA } = useParams()
  const { data } = useCommit({
    provider,
    owner,
    repo,
    commitid: commitSHA,
  })

  const commit = data?.commit
  const username = data?.commit?.author?.username

  const shortSHA = commitSHA?.slice(0, 7)
  const providerPullUrl = getProviderPullURL({
    provider,
    owner,
    repo,
    pullId: commit?.pullId,
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        {commit?.message && <TruncatedMessage message={commit?.message} />}
        <div className="flex items-center text-ds-gray-quinary gap-2">
          <div>
            {commit?.createdAt && (
              <span className="font-light">
                {formatTimeToNow(commit?.createdAt)}
              </span>
            )}{' '}
            {username && (
              <A
                to={{
                  pageName: 'owner',
                  options: { owner: username },
                }}
              >
                {username}
              </A>
            )}{' '}
            <span className="font-light">authored commit</span>{' '}
            <A
              variant="code"
              href={getProviderCommitURL({
                provider,
                owner,
                repo,
                commit: commitSHA,
              })}
              hook="provider commit url"
              isExternal={true}
            >
              {shortSHA}
            </A>
          </div>
          <CIStatusLabel ciPassed={commit?.ciPassed} />
          <span className="flex items-center flex-none">
            <Icon name="branch" variant="developer" size="sm" />
            {commit?.branchName}
          </span>
          <PullLabel
            pullId={commit?.pullId}
            provider={provider}
            providerPullUrl={providerPullUrl}
          />
        </div>
      </div>
      <hr />
    </div>
  )
}

export default Header
