/* eslint-disable react/prop-types */
import { forwardRef } from 'react'

const RadioInput = forwardRef(
  ({ label, variant, onChange, checked, ...props }, ref) => {
    console.log('hereee', props)
    return (
      <div className="flex items-center">
        <input
          {...props}
          ref={ref}
          checked={checked}
          className="mr-2"
          type="radio"
          onChange={onChange}
        />
        {variant === 'label' && <>{label}</>}
      </div>
    )
  }
)

RadioInput.displayName = 'RadioInput'

export default RadioInput
