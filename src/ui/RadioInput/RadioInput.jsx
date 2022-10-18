import cs from 'classnames'
import uniqueId from 'lodash/uniqueId'
import PropTypes from 'prop-types'
import { forwardRef } from 'react'

import { dataMarketingType } from 'shared/propTypes'

const RadioInput = forwardRef(
  ({ label, showLabel = true, disabled, dataMarketing, ...props }, ref) => {
    const id = uniqueId('radio-input')
    const { className, ...newProps } = props

    return (
      <div
        className={cs('flex items-center', {
          'text-ds-gray-quaternary': disabled,
          'text-ds-gray-octonary': !disabled,
        })}
      >
        <input
          data-marketing={dataMarketing}
          id={id}
          ref={ref}
          disabled={disabled}
          className="cursor-pointer mr-2"
          type="radio"
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

RadioInput.displayName = 'RadioInput'

RadioInput.propTypes = {
  label: PropTypes.string,
  disabled: PropTypes.bool,
  showLabel: PropTypes.bool,
  dataMarketing: dataMarketingType,
}

export default RadioInput
