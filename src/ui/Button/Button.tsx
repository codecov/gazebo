import cs from 'classnames'

import AppLink from 'shared/AppLink'
import Spinner from 'ui/Spinner'

/*  
    Don't love these, as they grew it looks like it's been throw a bunch of one offs including the listbox variant.
    When I convert button to TypeScript I will clean up these variants and look at CVA.
*/
const baseClass = `
  flex items-center gap-1
  rounded py-1 px-4
  transition-colors duration-150 motion-reduce:transition-none

  focus:outline-none focus:ring

  disabled:cursor-not-allowed 
`
const baseDisabledClasses = `disabled:text-ds-gray-quaternary disabled:border-ds-gray-tertiary disabled:bg-ds-gray-primary`
const variantClasses = {
  default: `
    justify-center font-semibold
    text-ds-gray-octonary bg-ds-gray-primary border-ds-gray-quaternary
    border-solid border shadow

    hover:bg-ds-gray-secondary
  `,
  primary: `
    justify-center font-semibold
    text-white bg-ds-blue-darker dark:bg-ds-blue-nonary border-ds-blue-quinary
    border-solid border shadow

    hover:bg-ds-blue-quinary
  `,
  danger: `
    justify-center font-semibold
    text-ds-primary-red border-ds-primary-red
    border-solid border shadow

    hover:text-white hover:bg-ds-primary-red
  `,
  secondary: `
    justify-center font-semibold
    text-white bg-ds-pink-default border-ds-pink-tertiary
    border-solid border shadow
    hover:bg-ds-pink-tertiary
  `,
  plain: `
    justify-center font-semibold
    text-ds-gray-quaternary

    hover:text-ds-gray-octonary
    focus:ring-0
  `,
  listbox: `
    justify-start
    focus:outline-none focus:ring-0
  `,
  github: `
    justify-center font-semibold
    border border-solid border-github
    bg-github hover:bg-ds-container dark:hover:bg-github-hover
    dark:border-bg-ds-gray-quaternary
    text-github-text hover:text-github dark:text-app-primary-text
    transition-colors duration-75 ease-in
  `,
  gitlab: `
    justify-center font-semibold
    border border-solid border-gitlab
    bg-gitlab hover:bg-ds-container dark:border-[rgb(247,248,251)]
    text-white hover:text-gitlab
    transition-colors duration-75 ease-in
  `,
  bitbucket: `
    justify-center font-semibold
    border border-solid border-bitbucket
    bg-bitbucket hover:bg-ds-container dark:border-[rgb(247,248,251)]
    text-white hover:text-bitbucket
    transition-colors duration-75 ease-in
  `,
  okta: `
    justify-center font-semibold
    border border-solid border-okta
    bg-okta hover:bg-ds-container dark:border-[rgb(153,159,167)]
    text-okta-text hover:text-okta
    transition-colors duration-75 ease-in
  `,
}

const loadingVariantClasses = {
  default: `disabled:bg-ds-gray-secondary disabled:text-ds-gray-octonary disabled:border-ds-gray-quaternary`,
  primary: `justify-center border border-solid font-semibold text-white shadow disabled:border-ds-blue-quinary disabled:bg-ds-blue-quinary`,
  danger: `disabled:text-white disabled:border-ds-primary-red disabled:bg-ds-primary-red`,
  secondary: `disabled:text-white disabled:border-ds-pink-tertiary disabled:bg-ds-pink-default`,
}

function pickVariant(
  variant: keyof typeof variantClasses | keyof typeof loadingVariantClasses,
  loading: boolean
) {
  return loading
    ? loadingVariantClasses[variant as keyof typeof loadingVariantClasses]
    : variantClasses[variant as keyof typeof variantClasses]
}

// using this type until AppLink is converted to TypeScript
export interface AppLinkProps {
  pageName: string
  text?: string
  options?: object
  activeClassName?: string
  showExternalIcon?: boolean
  type?: 'submit' | 'button' | 'reset'
  children?: React.ReactNode
  exact?: boolean
}

interface WithTo {
  to: AppLinkProps
  hook?: string
}
interface WithoutTo {
  to?: never
  hook: string
}

interface ButtonProps extends React.HTMLProps<HTMLButtonElement> {
  variant?: keyof typeof variantClasses
  isLoading?: boolean
  disabled?: boolean
}

type ExtendedButtonProps = ButtonProps &
  (WithTo | WithoutTo) &
  Partial<AppLinkProps>

function Button({
  to,
  variant = 'default',
  isLoading = false,
  disabled,
  hook,
  children,
  ...props
}: ExtendedButtonProps) {
  const className = cs(
    baseClass,
    { [baseDisabledClasses]: !isLoading },
    pickVariant(variant, isLoading)
  )

  const content = (
    <>
      {isLoading && (
        <span className="mr-0.5 text-white">
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
    <button
      {...completeProps}
      className={className}
      data-cy={hook}
      data-marketing={hook}
      data-testid={hook}
    >
      {content}
    </button>
  )
}

export default Button
