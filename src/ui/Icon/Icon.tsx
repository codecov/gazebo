import camelCase from 'lodash/camelCase'

import { cn } from 'shared/utils/cn'

import * as svgDeveloper from './svg/developer'
import * as svgOutline from './svg/outline'
import * as svgSolid from './svg/solid'

const iconComponentCollection = {
  outline: svgOutline,
  solid: svgSolid,
  developer: svgDeveloper,
}

type IconCollection = typeof iconComponentCollection
type Variant = keyof IconCollection

export type OutlineIconCollection = typeof svgOutline
type SolidIconCollection = typeof svgSolid
type DeveloperIconCollection = typeof svgDeveloper

type Name = keyof (OutlineIconCollection &
  SolidIconCollection &
  DeveloperIconCollection)

function isValidKey<T extends Record<string, any>>(
  obj: T,
  key: keyof any
): key is keyof T {
  return key in obj
}

function get(
  iconCollection: IconCollection,
  type: Variant,
  name: Name
): React.FunctionComponent<React.SVGAttributes<SVGElement>> | undefined {
  const collection = iconCollection[type]
  const camelName = camelCase(name)

  if (camelName && isValidKey(collection, camelName)) {
    return collection[camelName]
  }
}

const iconClasses = {
  sm: 'w-4 h-4',
  flex: 'w-5 h-5', // This doesn't look right?
  md: 'w-6 h-6',
  lg: 'w-16 h-16',
}

type CommonProps = {
  size?: 'sm' | 'md' | 'lg' | 'flex'
  label?: string
  className?: string
}

type OutlineIconProps = {
  name: keyof OutlineIconCollection
  variant?: 'outline'
} & CommonProps

type SolidIconProps = {
  name: keyof SolidIconCollection
  variant?: 'solid'
} & CommonProps

type DeveloperIconProps = {
  name: keyof DeveloperIconCollection
  variant?: 'developer'
} & CommonProps

type IconProps = OutlineIconProps | SolidIconProps | DeveloperIconProps

function Icon({
  name,
  variant = 'outline',
  size = 'md',
  label = '',
  className,
}: IconProps) {
  const IconSvg = get(iconComponentCollection, variant, name)
  if (!IconSvg || !isValidKey(iconClasses, size)) return null

  return (
    <IconSvg
      data-testid={label}
      data-icon={label}
      className={cn(className, iconClasses[size])}
    />
  )
}

export default Icon
