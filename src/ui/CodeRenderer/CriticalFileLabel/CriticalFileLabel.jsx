import cs from 'classnames'
import PropTypes from 'prop-types'

import A from 'ui/A'
import Icon from 'ui/Icon'

const baseClass = `
  pointer-events-auto
  flex
  flex-row
  gap-1
  bg-ds-gray-primary
  px-3
  py-1
  items-center
  border-r
  border-l
  border-solid
  border-ds-gray-tertiary
`

const variantClasses = {
  default: ``,
  borderBottom: `border-b`,
  borderTop: `border-t`,
}

function CriticalFileLabel({ variant = 'default' }) {
  const className = cs(baseClass, variantClasses[variant])

  return (
    <div className={className}>
      <div className="text-ds-primary-yellow">
        <Icon name="exclamation-circle" size="sm" variant="outline" />
      </div>
      <p>
        This is a <span className="font-semibold">critical file</span>, which
        contains lines commonly executed in production{' '}
        <A
          variant="link"
          isExternal
          href="https://docs.codecov.com/docs/runtime-insights"
          hook="codecov-docs"
        >
          <span className="font-semibold">learn more</span>
        </A>
      </p>
    </div>
  )
}

CriticalFileLabel.propTypes = {
  variant: PropTypes.oneOf(['default', 'borderBottom', 'borderTop']),
}

export default CriticalFileLabel
