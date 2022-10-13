import A from 'ui/A'
import Icon from 'ui/Icon'
import Summary from 'ui/Summary'
import TotalsNumber from 'ui/TotalsNumber'

import { usePullForCompareSummary } from './usePullForCompareSummary'

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
              {headCommit.slice(0, 7)}
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

function compareCards({ head, base, hasDifferentNumberOfHeadAndBaseReports }) {
  const headCommit = head?.commitid
  const baseCommit = base?.commitid
  return [
    {
      name: 'source',
      title: 'Source',
      value: headCommit && baseCommit && (
        <>
          {hasDifferentNumberOfHeadAndBaseReports ? (
            <>
              <p className="text-ds-gray-octonary text-sm">
                Coverage data based on{' '}
                <span className="uppercase font-medium">head</span>{' '}
                <A to={{ pageName: 'commit', options: { commit: headCommit } }}>
                  {headCommit?.slice(0, 7)}
                  <span>({head?.uploads?.totalCount} uploads)</span>
                </A>{' '}
                compared to <span className="uppercase font-medium">base</span>{' '}
                <A to={{ pageName: 'commit', options: { commit: baseCommit } }}>
                  {baseCommit?.slice(0, 7)}
                  <span>({base?.uploads?.totalCount} uploads)</span>
                </A>{' '}
              </p>
              <div className="flex gap-1 text-sm">
                <div className="text-warning-500">
                  <Icon name="exclamation-circle" size="sm" variant="outline" />
                </div>
                <p className="text-xs">
                  Commits have different number of coverage report uploads{' '}
                  <A
                    variant="semibold"
                    hook="learn-more"
                    href={
                      'https://docs.codecov.com/docs/unexpected-coverage-changes#mismatching-base-and-head-commit-upload-counts'
                    }
                    isExternal
                  >
                    learn more
                  </A>{' '}
                </p>
              </div>
            </>
          ) : (
            <p className="text-ds-gray-octonary text-sm">
              Coverage data based on{' '}
              <span className="uppercase font-medium">head</span>{' '}
              <A to={{ pageName: 'commit', options: { commit: headCommit } }}>
                {headCommit?.slice(0, 7)}
              </A>{' '}
              compared to <span className="uppercase font-medium">base</span>{' '}
              <A to={{ pageName: 'commit', options: { commit: baseCommit } }}>
                {baseCommit?.slice(0, 7)}
              </A>{' '}
            </p>
          )}
        </>
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
              {recentCommit?.commitid?.slice(0, 7)}
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
    recentCommit,
    head,
    base,
    hasDifferentNumberOfHeadAndBaseReports,
  } = usePullForCompareSummary()

  const fields = [
    ...totalsCards({
      headCoverage,
      headCommit: head?.commitid,
      patchCoverage,
      changeCoverage,
    }),
    ...compareCards({ head, base, hasDifferentNumberOfHeadAndBaseReports }),
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
