import isNumber from 'lodash/isNumber'

import A from 'ui/A'
import Change from 'ui/Change'
import Summary from 'ui/Summary'

import { usePullForCompareSummary } from './hooks'

function totalsCards({
  headCoverage,
  headCommit,
  patchCoverage,
  changeCoverage,
}) {
  return [
    // TODO: change the "value" for Head and Patch to the component
    {
      name: 'head',
      title: (
        <>
          <span>HEAD</span>
          {headCommit && (
            <span className="text-ds-gray-octonary">
              {headCommit.substr(0, 7)}
            </span>
          )}
        </>
      ),
      value: headCoverage ? `${headCoverage} %` : '-',
    },
    {
      name: 'patch',
      title: 'Patch',
      value: (
        <span className="text-sm text-right w-full text-ds-gray-octonary">
          {isNumber(patchCoverage) ? `${patchCoverage?.toFixed(2)}%` : '-'}
        </span>
      ),
    },
    {
      name: 'change',
      title: 'Change',
      value: <Change value={changeCoverage} variant="coverageCard" />,
    },
  ]
}

function compareCards({ headCommit, baseCommit }) {
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

function CompareSummary() {
  const {
    headCoverage,
    patchCoverage,
    changeCoverage,
    headCommit,
    baseCommit,
  } = usePullForCompareSummary()

  console.log(headCommit, patchCoverage, changeCoverage, headCommit, baseCommit)

  const fields = [
    ...totalsCards({ headCoverage, headCommit, patchCoverage, changeCoverage }),
    ...compareCards({ headCommit, baseCommit }),
  ]

  return <Summary fields={fields} />
}

export default CompareSummary
