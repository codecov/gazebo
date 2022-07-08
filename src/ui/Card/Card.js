import PropTypes from 'prop-types'

const baseStyles = {
  header: 'text-2xl bold mb-4',
  footer: 'border-t border-ds-gray-secondary p-4',
}

// TODO: Make a card variant that creates a divisor bw entries, see Card from PullRequestPage
const variantClasses = {
  default: 'border border-ds-gray-secondary rounded p-6',
  large: 'border border-ds-gray-secondary rounded p-12',
  cancel: 'border border-codecov-red px-12 py-10',
}

// className="px-12 py-10 pb-4 mb-4"> - Large
// className="p-6 mb-4" - small
// className="p-6 mb-4" - small
// className="p-6 mb-4" - small

// className="w-1/2 p-8"
// className="p-10 text-codecov-red"
// className="p-10 text-color-900 md:w-1/2 md:mr-8"
// className="border border-codecov-red px-12 py-10"
// className="p-10" (X2)
// className="p-10 mt-8"
// className="grow max-w-xl mr-4 px-12 py-10 pb-4"
// className="shadow divide-y divide-gray-200 divide-solid p-6"
// className="p-4 mt-4 flex text-sm items-center"
// className="flex flex-col items-center px-12 py-10"

function Card({ children, header, footer, variant = 'default' }) {
  return (
    <article className={variantClasses[variant]}>
      {header && <div className={baseStyles.header}>{header}</div>}
      {children}
      {footer && <div className={baseStyles.footer}>{footer}</div>}
    </article>
  )
}

Card.propTypes = {
  header: PropTypes.node,
  footer: PropTypes.node,
  variant: PropTypes.string,
}

export default Card
