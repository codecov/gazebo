import isNumber from 'lodash/isNumber'
import PropTypes from 'prop-types'

import { getProviderPullURL } from 'shared/utils/provider'
import A from 'ui/A'
import Change from 'ui/Change'
import SummaryCard from 'ui/SummaryCard/SummaryCard'

import CIStatusLabel from './CIStatusLabel'
import Header from './Header'
import PullLabel from './PullLabel'

/* 
  TODO This/useCommit was not implemented correctly and needs a refactor, leaving for the moment.
  - useCommit is not reusable and also does not let you fetch commit data without polling files which is another call
  - Rather then needing extractCommitData we should be able to use a hook with the same cache key as
    useCommit, refrencing the caches data without passing it down but not making a new api call.
  - This will elimentate the need for the passed "data" props and complex PropTypes.
*/
function extractCommitData(data) {
  const rawPatch = data?.compareWithParent?.patchTotals?.coverage
  const patch = isNumber(rawPatch) ? `${(rawPatch * 100).toFixed(2)} %` : '-'
  const coverage = data?.totals?.coverage
  const parentCoverage = data?.parent?.totals?.coverage

  return {
    coverage,
    patch,
    commitid: data?.commitid?.substr(0, 7),
    parentCommitid: data?.parent?.commitid,
    ciPassed: data?.ciPassed,
    state: data?.state,
    change: coverage - parentCoverage,
  }
}

function CoverageReportCard({ data, provider, repo, owner }) {
  const { coverage, commitid, parentCommitid, ciPassed, change, patch, state } =
    extractCommitData(data)

  const providerPullUrl = getProviderPullURL({
    provider,
    owner,
    repo,
    pullId: data?.pullId,
  })

  return (
    <div className="flex flex-1 p-4 gap-4 flex-col border text-ds-gray-octonary">
      <Header state={state} />
      <div className="flex gap-4 px-4 justify-between flex-1 text-xs">
        <SummaryCard
          title={
            <>
              <span>HEAD</span>
              <span className="text-ds-gray-octonary">{commitid}</span>
            </>
          }
        >
          {coverage ? `${coverage} %` : '-'}
        </SummaryCard>
        <SummaryCard title="Patch">
          <span className="text-xl text-center font-light">{patch}</span>
        </SummaryCard>
        <SummaryCard title="Change">
          <Change value={change} variant="coverageCard" />
        </SummaryCard>
      </div>
      {state === 'error' ? (
        <p className="flex-1 text-ds-gray-quinary text-sm leading-5">
          There is an error processing the coverage reports; some of the data
          may be inacurrate. Common issues are{' '}
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
      ) : (
        <p className="flex-1 text-ds-gray-quinary">
          The coverage of changes for this commit is {patch} (patch). Data
          source from comparing between{' '}
          <A to={{ pageName: 'commit', options: { commit: parentCommitid } }}>
            {parentCommitid?.substr(0, 7)}
          </A>{' '}
          and <span className="font-mono">{commitid}</span>
        </p>
      )}
      <div className="flex gap-2">
        <CIStatusLabel ciPassed={ciPassed} />
        <PullLabel
          pullId={data?.pullId}
          provider={provider}
          providerPullUrl={providerPullUrl}
        />
      </div>
    </div>
  )
}

CoverageReportCard.propTypes = {
  data: PropTypes.shape({
    totals: PropTypes.shape({
      coverage: PropTypes.number,
    }),
    compareWithParent: PropTypes.shape({
      patchTotals: PropTypes.shape({
        coverage: PropTypes.number,
      }),
    }),
    commitid: PropTypes.string,
    parent: PropTypes.shape({
      commitid: PropTypes.string,
      totals: PropTypes.shape({
        coverage: PropTypes.number,
      }),
    }),
    ciPassed: PropTypes.bool,
    pullId: PropTypes.number,
    ciUrl: PropTypes.string,
  }),
  provider: PropTypes.string,
  repo: PropTypes.string,
  owner: PropTypes.string,
  state: PropTypes.string,
}

export default CoverageReportCard
