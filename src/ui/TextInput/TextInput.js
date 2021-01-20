import { forwardRef } from 'react'
import cs from 'classnames'

const TextInput = forwardRef(({ className = '', ...props }, ref) => {
  const classes = cs(
    className,
    'block w-full px-6 py-2 rounded-full',
    'bg-gray-100 text-gray-900 caret-pink-500'
  )

  return <input ref={ref} type="text" className={classes} {...props} />
})

TextInput.displayName = 'TextInput'

export default TextInput
