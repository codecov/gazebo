import cs from 'classnames'
import PropTypes from 'prop-types'

import Icon from 'ui/Icon'

export default function CIStatusLabel({ ciPassed }) {
  return (
    <div className="flex items-center gap-1 text-xs">
      <span
        className={cs({
          'text-ds-primary-green': ciPassed,
          'text-ds-primary-red': !ciPassed,
        })}
      >
        <Icon size="sm" name={ciPassed ? 'check' : 'x'} />
      </span>
      <p>CI {ciPassed ? 'Passed' : 'Failed'}</p>
    </div>
  )
}

CIStatusLabel.propTypes = {
  ciPassed: PropTypes.bool,
}
