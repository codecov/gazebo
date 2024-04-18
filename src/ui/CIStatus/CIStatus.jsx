import cs from 'classnames'
import isNil from 'lodash/isNil'
import PropTypes from 'prop-types'

import Icon from 'ui/Icon'

export default function CIStatusLabel({ ciPassed }) {
  if (isNil(ciPassed)) {
    return (
      <span className="flex flex-none items-center gap-1 text-xs">
        <span className="text-ds-gray-senary">
          <Icon size="sm" name="ban" />
        </span>
        No Status
      </span>
    )
  }

  return (
    <span className="flex flex-none items-center gap-1 text-xs">
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
