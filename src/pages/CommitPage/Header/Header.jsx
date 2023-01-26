import { useParams } from 'react-router-dom'

import { getProviderCommitURL, getProviderPullURL } from 'shared/utils'
import { formatTimeToNow } from 'shared/utils/dates'
import A from 'ui/A'
import CIStatusLabel from 'ui/CIStatus'
import Icon from 'ui/Icon'

import { useCommitHeaderData } from './hooks'
import PullLabel from './PullLabel'
import TruncatedMessage from './TruncatedMessage'

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
        {commit?.message && <TruncatedMessage message={commit?.message} />}
        <div className="flex items-center text-ds-gray-quinary gap-2">
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
