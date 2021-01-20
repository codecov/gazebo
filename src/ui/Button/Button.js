import PropTypes from 'prop-types'

const basicClass =
  'cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200 ease-in-out'

const variantToClass = {
  normal:
    'py-2 px-4 rounded-full hover:text-white visited:text-white text-white',
  outline: 'py-2 px-4 rounded-full border border-solid hover:text-white',
  text: 'underline hover:no-underline py-0 px-0',
}

const colorToClass = {
  pink: {
    normal: 'bg-pink-500 hover:bg-pink-100',
    text: 'text-pink-500',
    outline: 'border-current text-pink-500 hover:bg-pink-500',
  },
  blue: {
    normal: 'bg-blue-400 hover:bg-blue-600',
    text: 'text-blue-400',
    outline: 'border-current text-blue-400 hover:bg-blue-400',
  },
  gray: {
    normal: 'bg-gray-500 hover:bg-gray-600',
    text: 'text-gray-500',
    outline: 'border-current text-gray-500 hover:bg-gray-900',
  },
  red: {
    normal: 'bg-codecov-red hover:bg-red-800',
    text: 'text-codecov-red',
    outline: 'border-current text-codecov-red hover:bg-codecov-red',
  },
}

function Button({
  color = 'blue',
  variant = 'normal',
  Component = 'button',
  className = '',
  ...props
}) {
  // concat all the different classNames
  const classes = [
    basicClass,
    variantToClass[variant],
    colorToClass[color][variant],
    className,
  ].join(' ')

  return <Component className={classes} {...props} />
}

Button.propTypes = {
  color: PropTypes.oneOf(Object.keys(colorToClass)),
  variant: PropTypes.oneOf(Object.keys(variantToClass)),
  Component: PropTypes.elementType,
}

export default Button
