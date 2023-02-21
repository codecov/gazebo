import cs from 'classnames'
import uniqueId from 'lodash/uniqueId'
import PropTypes from 'prop-types'
import { forwardRef } from 'react'

import { dataMarketingType } from 'shared/propTypes'

const Checkbox = forwardRef(
  ({ label, showLabel = true, disabled, ...props }, ref) => {
    const id = uniqueId('radio-input')
    const { className, dataMarketing, ...newProps } = props

    return (
      <div
        className={cs('flex items-center flex-wrap', {
          'text-ds-gray-quaternary': disabled,
          'text-ds-gray-octonary': !disabled,
        })}
      >
        <input
          data-marketing={`${dataMarketing}-checkbox`}
          id={id}
          ref={ref}
          disabled={disabled}
          className="mr-2 cursor-pointer"
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
  dataMarketing: dataMarketingType,
}

export default Checkbox
