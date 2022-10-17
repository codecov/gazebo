import cs from 'classnames'
import uniqueId from 'lodash/uniqueId'
import PropTypes from 'prop-types'
import { forwardRef } from 'react'

import { marketingHookType } from 'shared/propTypes'

const Checkbox = forwardRef(
  ({ label, showLabel = true, disabled, ...props }, ref) => {
    const id = uniqueId('radio-input')
    const { className, hook, ...newProps } = props

    return (
      <div
        className={cs('flex items-center flex-wrap', {
          'text-ds-gray-quaternary': disabled,
          'text-ds-gray-octonary': !disabled,
        })}
      >
        <input
          data-marketing={`${hook}-checkbox`}
          id={id}
          ref={ref}
          disabled={disabled}
          className="cursor-pointer mr-2"
          type="checkbox"
          {...newProps}
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
  hook: marketingHookType,
}

export default Checkbox
