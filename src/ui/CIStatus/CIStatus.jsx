import cs from 'classnames'
import isNil from 'lodash/isNil'
import PropTypes from 'prop-types'

import Icon from 'ui/Icon'

export default function CIStatusLabel({ ciPassed }) {
  if (isNil(ciPassed)) {
    return (
      <span className="flex items-center text-xs flex-none gap-1">
        <span>
          <Icon size="sm" name="statusRunning" variant="developer" />
        </span>
        Processing
      </span>
    )
  }

  return (
    <span className="flex items-center text-xs flex-none gap-1">
      <span
        className={cs({
          'text-ds-primary-green': ciPassed,
          'text-ds-primary-red': !ciPassed,
        })}
      >
        <Icon size="sm" name={ciPassed ? 'check' : 'x'} />
      </span>
      CI {ciPassed ? 'Passed' : 'Failed'}
    </span>
  )
}

CIStatusLabel.propTypes = {
  ciPassed: PropTypes.bool,
}
