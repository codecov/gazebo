import Icon from 'ui/Icon'
import PropTypes from 'prop-types'
import cs from 'classnames'

function CoverageReportCard({ data }) {
  const coverage = data?.totals?.coverage.toFixed(2)
  const patch = data?.totals?.diff?.coverage?.toFixed(2)
  const commitid = data?.commitid?.substr(0, 7)
  const parentCommitid = data?.parent?.commitid?.substr(0, 7)
  const ciPassed = data?.ciPassed
  const pullId = data?.pullId
  const change = (coverage - data?.parent?.totals?.coverage).toFixed(2)

  function getCIStatusLabel() {
    return (
      <div className="flex items-center mr-7">
        <div
          className={cs('mr-1', {
            'text-ds-primary-green': ciPassed,
            'text-ds-primary-red': !ciPassed,
          })}
        >
          <Icon size="sm" name={ciPassed ? 'check' : 'x'} />
        </div>
        <span className="text-ds-blue-darker">
          CI {ciPassed ? 'Passed' : 'Failed'}
        </span>
        <div className="text-ds-gray-quinary ml-0.5">
          <Icon size="sm" name="external-link" />
        </div>
      </div>
    )
  }

  function renderPullLabel() {
    if (pullId)
      return (
        <div className="flex items-center">
          <a className="mr-1 text-ds-blue-darker" href="pullid">
            #{pullId}
          </a>
          (
          <a href="github" className="mr-0.5 text-ds-blue-darker">
            GitHub
          </a>
          <Icon size="sm" name="external-link" />)
        </div>
      )
    return null
  }

  return (
    <div className="flex w-full p-4 flex-col border text-ds-gray-octonary">
      <span className="font-semibold text-base">Coverage report</span>
      <div className="flex mt-4 justify-between w-full">
        <div className="flex flex-col justify-center">
          <div className="flex mb-1 text-xs font-semibold">
            <span className="mr-2 text-ds-gray-quinary">HEAD</span>
            <span className="font-mono">{commitid}</span>
          </div>
          <span className="text-xl text-center font-light">
            {coverage ? `${coverage} %` : '-'}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center">
          <span className="text-ds-gray-quinary text-xs font-semibold">
            Patch
          </span>
          <span className="text-xl text-center mt-1 font-light">
            {patch ? `${patch} %` : '-'}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center">
          <span className="text-ds-gray-quinary text-xs font-semibold">
            Change
          </span>
          <span
            className={cs('text-xl text-center mt-1 font-light', {
              'text-ds-primary-red': change < 0,
              'text-ds-primary-green': change >= 0,
            })}
          >
            {change ? `${change} %` : '-'}
          </span>
        </div>
      </div>
      <div className="w-full text-ds-gray-quinary text-xs mt-4">
        The average coverage of changes for this commit is{' '}
        {patch ? `${patch} %` : '-'} (patch). Data source from comparing between{' '}
        <span className="font-mono text-ds-blue-darker">{parentCommitid}</span>{' '}
        and <span className="font-mono">{commitid}</span>
      </div>
      <div className="mt-4 text-xs flex">
        {getCIStatusLabel()}
        {renderPullLabel()}
      </div>
    </div>
  )
}

CoverageReportCard.propTypes = {
  data: PropTypes.shape({
    totals: PropTypes.shape({
      coverage: PropTypes.number,
      diff: PropTypes.shape({
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
  }),
}

export default CoverageReportCard
