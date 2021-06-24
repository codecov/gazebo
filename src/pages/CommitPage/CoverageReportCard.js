/* eslint-disable max-statements */
import Icon from 'ui/Icon'
import PropTypes from 'prop-types'
import cs from 'classnames'
import { providerToName } from 'shared/utils'
import AppLink from 'shared/AppLink'
import { getProviderPullURL } from './helpers'

function CoverageReportCard({ data, provider, repo, owner }) {
  const coverage = data?.totals?.coverage.toFixed(2)
  const patch = data?.totals?.diff?.coverage?.toFixed(2)
  const commitid = data?.commitid?.substr(0, 7)
  const parentCommitid = data?.parent?.commitid
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
        <a href={'cibuild?'} className="flex text-ds-blue-darker">
          CI {ciPassed ? 'Passed' : 'Failed'}
          <div className="text-ds-gray-quinary ml-0.5">
            <Icon size="sm" name="external-link" />
          </div>
        </a>
      </div>
    )
  }

  function renderPullLabel() {
    if (pullId) {
      return (
        <div className="flex items-center">
          <div className="text-ds-gray-senary">
            <Icon size="sm" variant="developer" name="pull-request-open" />
          </div>
          <AppLink
            className="text-ds-blue-darker text-regular mx-1"
            pageName="pull"
            options={{ pullid: pullId }}
          >
            #{pullId}
          </AppLink>
          (
          <a
            href={`${getProviderPullURL(provider, owner, repo)}/${pullId}`}
            className="mr-0.5 flex text-ds-blue-darker"
          >
            {providerToName(provider)}
            <div className="text-ds-gray-quinary ml-0.5">
              <Icon size="sm" name="external-link" />
            </div>
          </a>
          )
        </div>
      )
    }
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
        <AppLink
          pageName="commit"
          options={{ commit: parentCommitid }}
          className="text-ds-blue-darker"
        >
          {parentCommitid.substr(0, 7)}
        </AppLink>{' '}
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
    ciUrl: PropTypes.string,
  }),
  provider: PropTypes.string,
  repo: PropTypes.string,
  owner: PropTypes.string,
}

export default CoverageReportCard
