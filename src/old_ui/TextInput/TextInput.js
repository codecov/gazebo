import cs from 'classnames'
import PropTypes from 'prop-types'
import { forwardRef } from 'react'

const TextInput = forwardRef(({ embedded, className = '', ...props }, ref) => {
  const classes = cs(
    {
      [className]: !embedded,
    },
    'border-box block w-full px-6 py-2 rounded-full',
    'bg-gray-100 text-gray-900 caret-pink-500',
    {
      'pl-9': embedded,
    }
  )

  function _render() {
    return <input ref={ref} type="text" className={classes} {...props} />
  }

  function _embedded() {
    return (
      <span className="absolute top-0 left-0 m-3 w-4 h-4 z-10">
        {embedded()}
      </span>
    )
  }

  if (embedded) {
    return (
      <span className={cs(className, 'relative')}>
        {_embedded()}
        {_render()}
      </span>
    )
  }

  return _render()
})

TextInput.displayName = 'TextInput'

TextInput.propTypes = {
  embedded: PropTypes.func,
}

export default TextInput
