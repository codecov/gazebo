import { useSuspenseQuery as useSuspenseQueryV5 } from '@tanstack/react-queryV5'
import { useParams } from 'react-router-dom'

import { formatTimeToNow } from 'shared/utils/dates'
import { getProviderCommitURL, getProviderPullURL } from 'shared/utils/provider'
import A from 'ui/A'
import CIStatusLabel from 'ui/CIStatus'
import Icon from 'ui/Icon'
import TotalsNumber from 'ui/TotalsNumber'
import TruncatedMessage from 'ui/TruncatedMessage/TruncatedMessage'

import { CommitHeaderDataTeamQueryOpts } from './queries/CommitHeaderDataTeamQueryOpts'

import PullLabel from '../PullLabel'

function HeaderTeam() {
  const { provider, owner, repo, commit: commitSha } = useParams()
  const shortSHA = commitSha?.slice(0, 7)

  const { data: headerData } = useSuspenseQueryV5(
    CommitHeaderDataTeamQueryOpts({
      provider,
      owner,
      repo,
      commitId: commitSha,
    })
  )
  const commit = headerData?.commit

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
    commit: commitSha,
  })

  return (
    <div className="flex flex-col justify-between gap-2 border-b border-ds-gray-secondary pb-2 text-xs md:flex-row">
      <div className="flex flex-row flex-wrap items-center gap-6 divide-x divide-ds-gray-secondary">
        <div>
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
        <div className="flex flex-col justify-center gap-2 px-6">
          <h4 className="gap-2 font-mono text-xs text-ds-gray-quinary">
            Patch Coverage
          </h4>
          <TotalsNumber
            value={commit?.compareWithParent?.patchTotals?.percentCovered}
            plain
            large
          />
        </div>
      </div>
      <hr />
    </div>
  )
}

export default HeaderTeam
