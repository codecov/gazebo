import isNumber from 'lodash/isNumber'
import { useParams } from 'react-router-dom'

import { usePull } from 'services/pull/hooks'
import A from 'ui/A'
import Change from 'ui/Change'
import Summary from 'ui/Summary'

function totalsLabels({ head, patch, change }) {
  return [
    // TODO: change the "value" for Head and Patch to the component
    {
      name: 'head',
      title: (
        <>
          <span>HEAD</span>
          <span className="text-ds-gray-octonary">
            {head.commitid.substr(0, 7)}
          </span>
        </>
      ),
      value: head.totals.coverage ? `${head?.totals.coverage} %` : '-',
    },
    {
      name: 'patch',
      title: 'Patch',
      value: (
        <span className="text-sm text-right w-full text-ds-gray-octonary">
          {isNumber(patch) ? `${patch?.toFixed(2)}%` : '-'}
        </span>
      ),
    },
    {
      name: 'change',
      title: 'Change',
      value: <Change value={change} variant="coverageCard" />,
    },
  ]
}

function compareLabels({ headCommit, baseCommit }) {
  return [
    {
      name: 'source',
      title: 'Source',
      value: headCommit && baseCommit && (
        <p className="text-ds-gray-octonary text-sm">
          Coverage data based on{' '}
          <span className="uppercase font-medium">head</span>{' '}
          <A to={{ pageName: 'commit', options: { commit: headCommit } }}>
            {headCommit?.substr(0, 7)}
          </A>{' '}
          compared to <span className="uppercase font-medium">base</span>{' '}
          <A to={{ pageName: 'commit', options: { commit: baseCommit } }}>
            {baseCommit?.substr(0, 7)}
          </A>{' '}
        </p>
      ),
    },
  ]
}

function extractPullData(pull) {
  const compareWithBase = pull?.compareWithBase
  const head = pull?.head
  const base = pull?.comparedTo

  return {
    head,
    patch: compareWithBase?.patchTotals?.coverage,
    change: compareWithBase?.changeWithParent,
    compareCards: {
      headCommit: head?.commitid,
      baseCommit: base?.commitid,
    },
  }
}

function CompareSummary() {
  const { provider, owner, repo, pullid } = useParams()
  const { data: pull } = usePull({ provider, owner, repo, pullid })
  const { head, patch, change, compareCards } = extractPullData(pull)

  const labels = [
    ...totalsLabels({ head, patch, change }),
    ...compareLabels(compareCards),
  ]

  return <Summary labels={labels} />
}

export default CompareSummary
