import cs from 'classnames'
import gt from 'lodash/gt'
import isNumber from 'lodash/isNumber'
import PropTypes from 'prop-types'

import { LINE_STATE } from 'shared/utils/fileviewer'
import Icon from 'ui/Icon'

function CoverageIcon({ coverage }) {
  if (coverage !== LINE_STATE.UNCOVERED && coverage !== LINE_STATE.PARTIAL) {
    return null
  }

  return (
    <div
      className={cs('pr-1 flex items-center', {
        'text-ds-primary-red': coverage === LINE_STATE.UNCOVERED,
        'text-ds-primary-yellow': coverage === LINE_STATE.PARTIAL,
      })}
    >
      {coverage === LINE_STATE.UNCOVERED ? (
        <Icon
          name="exclamationTriangle"
          label="exclamationTriangle"
          size="sm"
          variant="outline"
        />
      ) : (
        <span data-testid="partial-icon">!</span>
      )}
    </div>
  )
}

CoverageIcon.propTypes = {
  coverage: PropTypes.oneOf([
    LINE_STATE.COVERED,
    LINE_STATE.UNCOVERED,
    LINE_STATE.PARTIAL,
    LINE_STATE.BLANK,
  ]).isRequired,
}

function CoverageHitCounter({ coverage, hitCount }) {
  if (isNumber(hitCount) && gt(hitCount, 0) && coverage !== LINE_STATE.BLANK) {
    return (
      <span
        className={cs(
          'text-white flex justify-center content-center items-center px-1.5 rounded-full text-center whitespace-nowrap',
          {
            'bg-ds-primary-red': coverage === LINE_STATE.UNCOVERED,
            'bg-ds-primary-yellow': coverage === LINE_STATE.PARTIAL,
            'bg-ds-primary-green': coverage === LINE_STATE.COVERED,
          }
        )}
      >
        {hitCount}
      </span>
    )
  }

  return null
}

CoverageHitCounter.propTypes = {
  coverage: PropTypes.oneOf([
    LINE_STATE.COVERED,
    LINE_STATE.UNCOVERED,
    LINE_STATE.PARTIAL,
    LINE_STATE.BLANK,
  ]).isRequired,
  hitCount: PropTypes.number,
}

function CoverageLineIndicator({ coverage, hitCount }) {
  return (
    <div className={cs('flex items-center', { 'pr-1': isNumber(hitCount) })}>
      <CoverageIcon coverage={coverage} />
      <CoverageHitCounter coverage={coverage} hitCount={hitCount} />
    </div>
  )
}

CoverageLineIndicator.propTypes = {
  coverage: PropTypes.oneOf([
    LINE_STATE.COVERED,
    LINE_STATE.UNCOVERED,
    LINE_STATE.PARTIAL,
    LINE_STATE.BLANK,
  ]).isRequired,
  hitCount: PropTypes.number,
}

export default CoverageLineIndicator
