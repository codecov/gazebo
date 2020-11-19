import PropType from 'prop-types'
import get from 'lodash/get'

import * as svg from './svg'

function Icon({ className = '', name, color = 'text-gray-500' }) {
  const IconSvg = get(svg, name, null)
  if (!IconSvg) return null
  return (
    <span className={`${color} ${className}`}>
      <IconSvg className="fill-current" />
    </span>
  )
}

Icon.propTypes = {
  name: PropType.string.isRequired,
  color: PropType.string,
}

export default Icon
