import qs from 'qs'
import { useLocation } from 'react-router-dom'

import { UploadStateEnum } from 'shared/utils/commit'
import A from 'ui/A'
import Summary from 'ui/Summary'
import TotalsNumber from 'ui/TotalsNumber'

import { useCommitForSummary } from './hooks'

const getSourceSummaryCards = ({
  headCommitId,
  parentCommitId,
  state,
  flags,
}) => {
  if (state?.toUpperCase() === UploadStateEnum.error) {
    return [
      {
        name: 'error',
        value: (
          <p className="max-w-sm border-l border-ds-gray-secondary pl-4 text-sm leading-5 text-ds-gray-quinary">
            There is an error processing the coverage reports. Common issues are{' '}
            <A
              hook="documentation for fixing paths"
              isExternal
              href="https://docs.codecov.com/docs/fixing-paths"
            >
              files paths
            </A>
            , empty files or expired reports. See error{' '}
            <A
              hook="documentation for commit errors"
              isExternal
              href="https://docs.codecov.com/docs/error-reference"
            >
              reference
            </A>{' '}
            page for additional troubleshooting to resolve error.
          </p>
        ),
      },
    ]
  }

  return [
    {
      name: 'source',
      title: 'Source',
      value:
        headCommitId && parentCommitId ? (
          <p className="text-sm text-ds-gray-octonary">
            This commit{' '}
            <span className="font-mono font-semibold">
              {headCommitId?.slice(0, 7)}
            </span>{' '}
            compared to{' '}
            <A
              to={{
                pageName: 'commit',
                options: { commit: parentCommitId, queryParams: { flags } },
              }}
            >
              {parentCommitId?.slice(0, 7)}
            </A>{' '}
          </p>
        ) : (
          // not really sure what to do here as value
          // is a required field on the Summary type
          <div />
        ),
    },
  ]
}

const getTotalsSummaryCards = ({
  headCoverage,
  headCommitId,
  patchCoverage,
  changeCoverage,
}) => [
  {
    name: 'head',
    title: (
      <>
        <span>HEAD</span>
        {headCommitId && (
          <span className="text-ds-gray-octonary">
            {headCommitId.slice(0, 7)}
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

function CommitCoverageSummary() {
  const location = useLocation()
  const queryParams = qs.parse(location.search, {
    ignoreQueryPrefix: true,
    depth: 1,
  })
  const flags = queryParams?.flags ?? []

  const {
    headCoverage,
    headCommitId,
    parentCommitId,
    changeCoverage,
    patchCoverage,
    state,
  } = useCommitForSummary()

  const totalSummaryCards = getTotalsSummaryCards({
    headCoverage,
    headCommitId,
    patchCoverage,
    changeCoverage,
  })

  const sourceSummaryCards = getSourceSummaryCards({
    headCommitId,
    parentCommitId,
    state,
    flags,
  })

  const fields = [...totalSummaryCards, ...sourceSummaryCards]

  return (
    <div className="border-b border-ds-gray-secondary pb-4">
      <Summary fields={fields} />
    </div>
  )
}

export default CommitCoverageSummary
