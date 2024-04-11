import cs from 'classnames'
import uniqueId from 'lodash/uniqueId'
import PropTypes from 'prop-types'
import { forwardRef } from 'react'

import { dataMarketingType } from 'shared/propTypes'

const RadioInput = forwardRef(
  (
    {
      label,
      showLabel = true,
      disabled,
      dataMarketing,
      id: idFromProps,
      ...props
    },
    ref
  ) => {
    const { className, ...newProps } = props
    const id = idFromProps || uniqueId('radio-input')
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
          className="mr-2 cursor-pointer"
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
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  disabled: PropTypes.bool,
  showLabel: PropTypes.bool,
  dataMarketing: dataMarketingType,
  id: PropTypes.string,
}

export default RadioInput
