import { useParams } from 'react-router-dom'

import { usePullBADropdownSummary } from 'services/pull/usePullBADropdownSummary'
import { formatSizeToString } from 'shared/utils/bundleAnalysis'
import A from 'ui/A'

interface URLParams {
  provider: string
  owner: string
  repo: string
  pullId: string
}

interface SourceCommitProps {
  commitid: string
}

const SourceCommit: React.FC<SourceCommitProps> = ({ commitid }) => {
  return (
    <p className="text-start text-sm">
      <span className="font-semibold">Source:</span> latest commit{' '}
      <A
        hook="bundles-tab-to-commit"
        isExternal={false}
        to={{
          pageName: 'commit',
          options: { commit: commitid },
        }}
      >
        <span className="font-mono">{commitid?.slice(0, 7)}</span>
      </A>
    </p>
  )
}

const BundleMessage: React.FC = () => {
  const { provider, owner, repo, pullId } = useParams<URLParams>()
  const { data } = usePullBADropdownSummary({
    provider,
    owner,
    repo,
    pullId: +pullId,
  })

  const commitid = data?.pull?.head?.commitid
  const comparison = data?.pull?.bundleAnalysisCompareWithBase

  if (comparison?.__typename === 'FirstPullRequest') {
    return (
      <div className="text-start">
        <p>
          <span className="font-semibold">Bundle report: </span>
          once merged to default, your following pull request and commits will
          include report details &#x2139;
        </p>
        {commitid ? <SourceCommit commitid={commitid} /> : null}
      </div>
    )
  }

  if (
    comparison?.__typename !== 'BundleAnalysisComparison' &&
    comparison?.message
  ) {
    return (
      <div>
        <p className="text-base">
          <span className="font-semibold">Bundle report: </span>
          {comparison?.message?.toLowerCase()} &#x26A0;&#xFE0F;
        </p>
        {commitid ? <SourceCommit commitid={commitid} /> : null}
      </div>
    )
  }

  if (comparison?.__typename === 'BundleAnalysisComparison') {
    const uncompressDelta = comparison?.bundleChange?.size?.uncompress
    const positiveSize = Math.abs(uncompressDelta)
    if (uncompressDelta < 0) {
      return (
        <div>
          <p className="text-base">
            <span className="font-semibold">Bundle report: </span>
            changes will decrease total bundle size by{' '}
            {formatSizeToString(positiveSize)} &#x2139;
          </p>
          {commitid ? <SourceCommit commitid={commitid} /> : null}
        </div>
      )
    }

    if (uncompressDelta > 0) {
      return (
        <div>
          <p className="text-base">
            <span className="font-semibold">Bundle report: </span>changes will
            increase total bundle size by {formatSizeToString(positiveSize)}{' '}
            &#x2139;
          </p>
          {commitid ? <SourceCommit commitid={commitid} /> : null}
        </div>
      )
    }

    return (
      <div>
        <p className="text-base">
          <span className="font-semibold">Bundle report: </span>bundle size has
          no change &#x2705;
        </p>
        {commitid ? <SourceCommit commitid={commitid} /> : null}
      </div>
    )
  }

  return (
    <div>
      <p className="text-base">
        <span className="font-semibold">Bundle report: </span>an unknown error
        occurred &#x26A0;&#xFE0F;
      </p>
      {commitid ? <SourceCommit commitid={commitid} /> : null}
    </div>
  )
}

export default BundleMessage
