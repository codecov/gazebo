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

  const { author, pullId, message, createdAt, branchName, ciPassed } =
    data?.commit

  const shortSHA = commitSHA?.slice(0, 7)
  const providerPullUrl = getProviderPullURL({
    provider,
    owner,
    repo,
    pullId,
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        {message && <TruncatedMessage message={message} />}
        <div className="flex items-center text-ds-gray-quinary gap-2">
          <div>
            {createdAt && (
              <span className="font-light">{formatTimeToNow(createdAt)}</span>
            )}{' '}
            {/* TODO: deconstruct username from author in a const above once we have less statements (after removing the top banner) */}
            {author?.username && (
              <A
                to={{
                  pageName: 'owner',
                  options: { owner: author.username },
                }}
              >
                {author.username}
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
          <CIStatusLabel ciPassed={ciPassed} />
          <span className="flex items-center flex-none">
            <Icon name="branch" variant="developer" size="sm" />
            {branchName}
          </span>
          <PullLabel
            pullId={pullId}
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
