import cs from 'classnames'
import PropTypes from 'prop-types'

import Icon from 'ui/Icon'

export default function CIStatusLabel({ ciPassed = false }) {
  return (
    <span className="flex items-center text-xs">
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
