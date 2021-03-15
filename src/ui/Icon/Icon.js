import PropType from 'prop-types'
import get from 'lodash/get'
import cs from 'classnames'

import * as svg from './svg'

const IconClasses = {
  sm: 'w-3 h-3 fill-current',
  md: 'w-6 h-6 fill-current',
  lg: 'w-16 h-16 fill-current',
}

function Icon({
  className = '',
  name,
  color = 'text-gray-500',
  testId,
  size = 'md',
  iconClass
}) {
  const IconSvg = get(svg, name, null)
  if (!IconSvg) return null
  return (
    <span className={cs(color, className)} data-testid={testId}>
      <IconSvg className={iconClass ? iconClass : IconClasses[size]} />
    </span>
  )
}

Icon.propTypes = {
  name: PropType.string.isRequired,
  color: PropType.string,
  testId: PropType.string,
  size: PropType.oneOf(['sm', 'md', 'lg']),
  iconClass: PropType.string
}

export default Icon
