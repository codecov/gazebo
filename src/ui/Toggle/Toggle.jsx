import cs from 'classnames'
import uniqueId from 'lodash/uniqueId'
import PropTypes from 'prop-types'

import { dataMarketingType } from 'shared/propTypes'
import Icon from 'ui/Icon'

const ToggleClasses = {
  button:
    'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-50',
  circle:
    'pointer-events-none translate-x-0 inline-block h-5 w-5 rounded-full bg-ds-container shadow transform ring-0 transition ease-in-out duration-200',
}

function Toggle({
  label,
  value = false,
  onClick,
  disabled = false,
  dataMarketing,
}) {
  const ID = uniqueId('toggle')

  return (
    <div
      data-marketing={`${ID}-${dataMarketing}`}
      onClick={() => {
        if (!disabled) {
          onClick()
        }
      }}
      className="flex items-center gap-1.5"
    >
      {label && (
        <label htmlFor={ID} className="cursor-pointer xl:whitespace-nowrap ">
          {label}
        </label>
      )}
      <button
        id={ID}
        className={cs(ToggleClasses.button, {
          'bg-ds-primary-base': value,
          'bg-ds-gray-quinary': !value && !disabled,
          'bg-ds-gray-quaternary': disabled,
          'cursor-not-allowed': disabled,
        })}
        aria-pressed="false"
        type="button"
        disabled={disabled}
        aria-disabled={disabled}
      >
        <span
          data-testid="switch"
          aria-hidden="true"
          className={cs(ToggleClasses.circle, {
            'translate-x-5': value,
            'translate-x-0': !value,
          })}
        >
          <div
            className={cs({
              'text-ds-primary-base': value,
              'text-ds-gray-quinary': !value && !disabled,
              'text-ds-gray-quaternary': disabled,
            })}
          >
            <Icon name={value ? 'check' : 'x'} variant="solid" size="flex" />
          </div>
        </span>
      </button>
    </div>
  )
}

Toggle.propTypes = {
  value: PropTypes.bool.isRequired,
  label: PropTypes.string,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  dataMarketing: dataMarketingType,
}

export default Toggle
