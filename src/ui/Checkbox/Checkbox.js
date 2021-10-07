import { forwardRef } from 'react'
import cs from 'classnames'
import uniqueId from 'lodash/uniqueId'
import PropTypes from 'prop-types'

const Checkbox = forwardRef(
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
          className="cursor-pointer mr-2"
          type="checkbox"
          {...props}
        />
        <label
          htmlFor={id}
          className={cs('cursor-pointer', { 'sr-only': showLabel === false })}
        >
          {label}
        </label>
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

Checkbox.propTypes = {
  label: PropTypes.string,
  disabled: PropTypes.bool,
  showLabel: PropTypes.bool,
}

export default Checkbox
