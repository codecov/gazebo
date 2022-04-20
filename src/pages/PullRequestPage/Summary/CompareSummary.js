import A from 'ui/A'
import Summary from 'ui/Summary'
import TotalsNumber from 'ui/TotalsNumber'

import { usePullForCompareSummary } from './hooks'

function totalsCards({
  headCoverage,
  headCommit,
  patchCoverage,
  changeCoverage,
}) {
  return [
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
      value: <TotalsNumber value={headCoverage} large plain />,
    },
    {
      name: 'patch',
      title: 'Patch',
      value: <TotalsNumber value={patchCoverage} large plain />,
    },
    {
      name: 'change',
      title: 'Change',
      value: (
        <TotalsNumber
          value={changeCoverage}
          showChange
          large
          data-testid="change-value"
        />
      ),
    },
  ]
}

function compareCards({ headCommit, baseCommit }) {
  return [
    {
      name: 'source',
      title: 'Source',
      value: headCommit && baseCommit && (
        <p className="text-ds-gray-octonary text-sm mt-2">
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

  const fields = [
    ...totalsCards({ headCoverage, headCommit, patchCoverage, changeCoverage }),
    ...compareCards({ headCommit, baseCommit }),
  ]

  return (
    <div className="border-b border-ds-gray-secondary pb-4">
      <Summary fields={fields} />
    </div>
  )
}

export default CompareSummary
