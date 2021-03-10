import PropType from 'prop-types'
import get from 'lodash/get'
import cs from 'classnames'

import * as svg from './svg'

const IconClasses = {
  sm: {
    width: 12,
    height: 12,
  },
  md: {
    width: 24,
    height: 24,
  },
  lg: {
    width: 64,
    height: 64,
  },
}

function Icon({
  className = '',
  name,
  color = 'text-gray-500',
  testId,
  size = 'md',
}) {
  const IconSvg = get(svg, name, null)
  if (!IconSvg) return null
  return (
    <span className={cs(color, className)} data-testid={testId}>
      <IconSvg style={IconClasses[size]} className="fill-current" />
    </span>
  )
}

Icon.propTypes = {
  name: PropType.string.isRequired,
  color: PropType.string,
  testId: PropType.string,
  size: PropType.string,
}

export default Icon
