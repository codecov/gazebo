import PropTypes from 'prop-types'
import cs from 'classnames'

const ToggleClasses = {
  button:
    'bg-gray-200 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-50',
  circle:
    'pointer-events-none translate-x-0 inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
}

function Toggle({ label, value = false, ...props }) {
  return (
    <button
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
      <span className="sr-only">{label}</span>
    </button>
  )
}

Toggle.propTypes = {
  value: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
}

export default Toggle
