import { forwardRef } from 'react'
import cs from 'classnames'
import uniqueId from 'lodash/uniqueId'
import PropTypes from 'prop-types'

const RadioInput = forwardRef(
  ({ label, showLabel = true, disabled, ...props }, ref) => {
    const id = uniqueId('radio-input')

    return (
      <div
        className={cs('flex items-center', {
          'text-ds-gray-quaternary': disabled,
          'text-ds-gray-octonary': !disabled,
        })}
      >
        <input
          id={id}
          ref={ref}
          disabled={disabled}
          className="mr-2"
          type="radio"
          {...props}
        />
        <label htmlFor={id} className={cs({ 'sr-only': showLabel === false })}>
          {label}
        </label>
      </div>
    )
  }
)

RadioInput.displayName = 'RadioInput'

RadioInput.propTypes = {
  label: PropTypes.string,
  disabled: PropTypes.bool,
  showLabel: PropTypes.bool,
}

export default RadioInput
