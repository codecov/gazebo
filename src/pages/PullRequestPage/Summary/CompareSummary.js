import A from 'ui/A'
import Icon from 'ui/Icon'
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

function pendingCard({ patchCoverage, headCoverage, changeCoverage }) {
  const card = []

  if (!patchCoverage && !headCoverage && !changeCoverage) {
    card.push({
      name: 'pending',
      value: (
        <p className="text-ds-gray-octonary text-sm mt-2 max-w-xs border-l border-solid border-ds-gray-secondary pl-4">
          <span className="font-medium">Why is there no coverage data?</span>{' '}
          the data is not yet available and still processing.
        </p>
      ),
    })
  }
  return card
}

function lastCommitErrorCard({ recentCommit }) {
  const card = []

  if (recentCommit?.state.toLowerCase() === 'error') {
    card.push({
      name: 'error',
      value: (
        <span className="flex gap-2 max-w-xs border-l border-solid border-ds-gray-secondary pl-4">
          <span className="text-ds-primary-red">
            <Icon name="exclamation" />
          </span>
          <p className="text-ds-gray-octonary text-sm">
            There is an error processing the coverage reports with{' '}
            <A
              to={{
                pageName: 'commit',
                options: { commit: recentCommit?.commitid },
              }}
            >
              {recentCommit?.commitid?.substr(0, 7)}
            </A>
            . As a result, some of the information may not be accurate.
          </p>
        </span>
      ),
    })
  }
  return card
}

function CompareSummary() {
  const {
    headCoverage,
    patchCoverage,
    changeCoverage,
    headCommit,
    baseCommit,
    recentCommit,
  } = usePullForCompareSummary()

  const fields = [
    ...totalsCards({ headCoverage, headCommit, patchCoverage, changeCoverage }),
    ...compareCards({ headCommit, baseCommit }),
    ...pendingCard({ patchCoverage, headCoverage, changeCoverage }),
    ...lastCommitErrorCard({ recentCommit }),
  ]

  return (
    <div className="border-b border-ds-gray-secondary pb-4">
      <Summary fields={fields} />
    </div>
  )
}

export default CompareSummary
