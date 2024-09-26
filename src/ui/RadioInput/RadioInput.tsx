import uniqueId from 'lodash/uniqueId'
import { forwardRef } from 'react'

import { cn } from 'shared/utils/cn'

interface RadioInputProps
  extends Omit<React.HTMLProps<HTMLInputElement>, 'label'> {
  label: React.ReactNode
  showLabel?: boolean
  disabled?: boolean
  dataMarketing?: string
  id?: string
}

const RadioInput = forwardRef<HTMLInputElement, RadioInputProps>(
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
        className={cn(
          'flex items-center',
          disabled ? 'text-ds-gray-quaternary' : 'text-ds-gray-octonary'
        )}
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
          className={cn('cursor-pointer', { 'sr-only': !showLabel })}
        >
          {label}
        </label>
      </div>
    )
  }
)

RadioInput.displayName = 'RadioInput'

export default RadioInput
