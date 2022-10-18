import PropTypes from 'prop-types'

const baseStyles = {
  header: 'text-2xl bold mb-4',
  footer: 'border-t border-ds-gray-secondary p-4',
}

// TODO: Make a card variant that creates a divisor bw entries, see Card from PullRequestPage
const variantClasses = {
  default: 'border border-ds-gray-secondary rounded p-6',
  large: 'border border-ds-gray-secondary rounded p-12',
  upgradeForm: 'border border-ds-gray-secondary rounded p-12 md:w-5/12',
  cancel: 'border border-codecov-red px-12 py-10',
}

// TODO: enhance as per https://github.com/codecov/gazebo/pull/1433#discussion_r918864691
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
  variant: PropTypes.oneOf(['default', 'large', 'cancel', 'upgradeForm']),
}

export default Card
