import cs from 'classnames'
import PropTypes from 'prop-types'

import { LINE_STATE } from 'shared/utils/fileviewer'
import Icon from 'ui/Icon'

function CoverageSelectIcon({ coverage }) {
  if (coverage !== LINE_STATE.UNCOVERED && coverage !== LINE_STATE.PARTIAL) {
    return null
  }

  return (
    <div
      className={cs('pr-1', {
        'text-ds-primary-red': coverage === LINE_STATE.UNCOVERED,
        'text-ds-primary-yellow': coverage === LINE_STATE.PARTIAL,
      })}
    >
      {coverage === LINE_STATE.UNCOVERED ? (
        <Icon name="exclamationTriangle" size="sm" variant="outline" />
      ) : (
        <span data-testid="partial-icon">!</span>
      )}
    </div>
  )
}

CoverageSelectIcon.propTypes = {
  coverage: PropTypes.oneOf([
    LINE_STATE.COVERED,
    LINE_STATE.UNCOVERED,
    LINE_STATE.PARTIAL,
    LINE_STATE.BLANK,
  ]).isRequired,
}

export default CoverageSelectIcon
