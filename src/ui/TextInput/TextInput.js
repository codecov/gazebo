import cs from 'classnames'

function TextInput({ className = '', ...props }) {
  const classes = cs(
    className,
    'block w-full px-6 py-2 rounded-full',
    'bg-gray-100 text-gray-900 caret-pink-500'
  )

  return <input type="text" className={classes} {...props} />
}

export default TextInput
