import PropType from 'prop-types'
import get from 'lodash/get'
import cs from 'classnames'

import * as svg from './svg'

function Icon({ className = '', name, color = 'text-gray-500', testId }) {
  const IconSvg = get(svg, name, null)
  if (!IconSvg) return null
  return (
    <span className={cs(color, className)} data-testid={testId}>
      <IconSvg className="fill-current" />
    </span>
  )
}

Icon.propTypes = {
  name: PropType.string.isRequired,
  color: PropType.string,
  testId: PropType.string,
}

export default Icon
