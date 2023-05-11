import { useParams } from 'react-router-dom'

import { getProviderCommitURL, getProviderPullURL } from 'shared/utils'
import { formatTimeToNow } from 'shared/utils/dates'
import A from 'ui/A'
import CIStatusLabel from 'ui/CIStatus'
import Icon from 'ui/Icon'
import TruncatedMessage from 'ui/TruncatedMessage/TruncatedMessage'

import { useCommitHeaderData } from './hooks'
import PullLabel from './PullLabel'

function Header() {
  const { provider, owner, repo, commit: commitSHA } = useParams()
  const shortSHA = commitSHA?.slice(0, 7)

  const { data: commit } = useCommitHeaderData({
    provider,
    owner,
    repo,
    commitId: commitSHA,
  })

  const providerPullUrl = getProviderPullURL({
    provider,
    owner,
    repo,
    pullId: commit?.pullId,
  })

  const providerCommitUrl = getProviderCommitURL({
    provider,
    owner,
    repo,
    commit: commitSHA,
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        {commit?.message && (
          <TruncatedMessage>{commit?.message}</TruncatedMessage>
        )}
        <div className="flex items-center gap-2 text-ds-gray-quinary">
          <div>
            {commit?.createdAt && (
              <span className="font-light">
                {formatTimeToNow(commit?.createdAt)}
              </span>
            )}{' '}
            {commit?.author?.username && (
              <A
                to={{
                  pageName: 'owner',
                  options: { owner: commit?.author?.username },
                }}
              >
                {commit?.author?.username}
              </A>
            )}{' '}
            <span className="font-light">authored commit</span>{' '}
            <A
              variant="code"
              href={providerCommitUrl}
              hook="provider commit url"
              isExternal={true}
            >
              {shortSHA}
            </A>
          </div>
          <CIStatusLabel ciPassed={commit?.ciPassed} />
          <span className="flex flex-none items-center">
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
