import cs from 'classnames'
import uniqueId from 'lodash/uniqueId'
import PropTypes from 'prop-types'

function checkClass(show, classes) {
  if (show) {
    return cs('cursor-pointer', classes)
  }
  return 'sr-only'
}

const ToggleClasses = {
  button:
    'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-50',
  circle:
    'pointer-events-none translate-x-0 inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
  label: checkClass,
}

function Toggle({
  label,
  showLabel = false,
  labelClass,
  value = false,
  ...props
}) {
  const ID = uniqueId('toggle')
  return (
    <>
      <button
        id={ID}
        className={cs(ToggleClasses.button, {
          'bg-blue-400': value,
          'bg-gray-200': !value,
        })}
        aria-pressed="false"
        type="button"
        {...props}
      >
        <span
          data-testid="switch"
          aria-hidden="true"
          className={cs(ToggleClasses.circle, {
            'translate-x-5': value,
            'translate-x-0': !value,
          })}
        ></span>
      </button>
      <label
        htmlFor={ID}
        className={ToggleClasses.label(showLabel, labelClass)}
      >
        {label}
      </label>
    </>
  )
}

Toggle.propTypes = {
  value: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
  labelClass: PropTypes.string,
  showLabel: PropTypes.bool,
}

export default Toggle
