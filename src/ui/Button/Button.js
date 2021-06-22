import PropTypes from 'prop-types'
import cs from 'classnames'

import AppLink from 'shared/AppLink'
import Spinner from 'ui/Spinner'

const baseClass = `
  flex justify-center items-center gap-1
  border-solid border
  font-semibold rounded py-1 px-4 shadow
  transition-colors duration-150 motion-reduce:transition-none

  focus:outline-none focus:ring

  disabled:cursor-not-allowed 
`
const baseDisabledClasses = `disabled:text-ds-gray-quaternary disabled:border-ds-gray-tertiary disabled:bg-ds-gray-primary disabled:text-ds-gray-primary`
const variantClasses = {
  default: `
    text-ds-gray-octonary bg-ds-gray-primary border-ds-gray-quaternary

    hover:bg-ds-gray-secondary
  `,
  primary: `
    text-white bg-ds-blue-medium border-ds-blue-quinary
    
    hover:bg-ds-blue-darker
  `,
  danger: `
    text-ds-primary-red border-ds-primary-red 

    hover:text-white hover:bg-ds-primary-red
  `,
}

const loadingVariantClasses = {
  default: `disabled:bg-ds-gray-secondary disabled:text-ds-gray-octonary disabled:border-ds-gray-quaternary`,
  primary: `disabled:bg-ds-blue-darker disabled:bg-ds-blue-medium text-white disabled:border-ds-blue-quinary`,
  danger: `disabled:text-white disabled:border-ds-primary-red disabled:bg-ds-primary-red`,
}

function pickVariant(variant, loading) {
  const set = loading ? loadingVariantClasses : variantClasses

  return set[variant]
}

function Button({
  to,
  variant = 'default',
  isLoading = false,
  disabled,
  children,
  ...props
}) {
  const className = cs(
    baseClass,
    { [baseDisabledClasses]: !isLoading },
    pickVariant(variant, isLoading)
  )

  const content = (
    <>
      {isLoading && (
        <span className="text-white mr-0.5">
          <Spinner />
        </span>
      )}
      {children}
    </>
  )

  const completeProps = {
    ...props,
    disabled: disabled || isLoading,
    className,
    children: content,
  }

  return to ? (
    <AppLink {...to} {...completeProps}>
      {content}
    </AppLink>
  ) : (
    <button {...completeProps} className={className}>
      {content}
    </button>
  )
}

Button.propTypes = {
  to: PropTypes.shape(AppLink.propTypes),
  variant: PropTypes.oneOf(['default', 'primary', 'danger']),
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
}

export default Button
