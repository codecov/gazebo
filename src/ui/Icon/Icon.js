import camelCase from 'lodash/camelCase'
import get from 'lodash/get'
import PropType from 'prop-types'

import * as svgDeveloper from './svg/developer'
import * as svgOutline from './svg/outline'
import * as svgSolid from './svg/solid'

const IconClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-16 h-16',
}

const IconCollection = {
  outline: svgOutline,
  solid: svgSolid,
  developer: svgDeveloper,
}

function Icon({ name, variant = 'outline', size = 'md' }) {
  const IconSvg = get(IconCollection, `${variant}.${camelCase(name)}`, null)
  if (!IconSvg) return null
  return <IconSvg className={IconClasses[size]} />
}

Icon.propTypes = {
  /* To add more icons, update /scripts/icons.js and run "npm run generate-icons"*/
  name: PropType.string.isRequired,
  variant: PropType.string,
  size: PropType.oneOf(['sm', 'md', 'lg']),
}

export default Icon
