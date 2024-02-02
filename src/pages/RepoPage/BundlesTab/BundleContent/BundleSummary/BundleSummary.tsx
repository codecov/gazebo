import isString from 'lodash/isString'
import { useParams } from 'react-router-dom'

import { useBranchBundleSummary } from 'services/branches'
import { formatSizeToString } from 'shared/utils/bundleAnalysis'
import A from 'ui/A'

interface URLParams {
  provider: string
  owner: string
  repo: string
}

const BundleSummary: React.FC = () => {
  const { provider, owner, repo } = useParams<URLParams>()
  const { data: branchBundle } = useBranchBundleSummary({
    provider,
    owner,
    repo,
  })

  const branchHead = branchBundle?.branch?.head

  if (branchHead?.bundleAnalysisReport?.__typename === 'BundleAnalysisReport') {
    const shortSha = branchHead?.commitid?.slice(0, 7)
    const sizeTotal = branchHead?.bundleAnalysisReport?.sizeTotal

    return (
      <div className="bg-ds-gray-primary p-4">
        <p className="w-full text-base">
          <span className="font-semibold">Report: </span>total combined bundle
          size {formatSizeToString(sizeTotal)} &#x2139;
        </p>
        <p className="pt-2 text-sm">
          <span className="font-semibold">Source:</span> latest commit{' '}
          <A
            hook="bundles-tab-to-commit"
            isExternal={false}
            to={{
              pageName: 'commit',
              options: { commit: branchHead.commitid },
            }}
          >
            <span className="font-mono">{shortSha}</span>
          </A>
        </p>
      </div>
    )
  }

  let message = branchHead?.bundleAnalysisReport?.message.toLowerCase()
  if (!isString(message)) {
    message = 'an unknown error has occurred'
  }

  return (
    <div className="bg-ds-gray-primary p-4">
      <p className="w-full text-base">
        <span className="font-semibold">Report: </span>
        {message} &#x26A0;
      </p>
      {isString(branchHead?.commitid) ? (
        <p className="pt-2 text-sm">
          <span className="font-semibold">Source:</span> latest commit{' '}
          <A
            hook="bundles-tab-to-commit"
            isExternal={false}
            to={{
              pageName: 'commit',
              options: { commit: branchHead?.commitid },
            }}
          >
            <span className="font-mono">
              {branchHead?.commitid?.slice(0, 7)}
            </span>
          </A>
        </p>
      ) : null}
    </div>
  )
}

export default BundleSummary
