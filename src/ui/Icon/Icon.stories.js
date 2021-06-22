import kebabCase from 'lodash/kebabCase'
import Icon from './Icon'

import * as svgOutline from './svg/outline'
import * as svgSolid from './svg/solid'

function Description() {
  return (
    <div>
      <h1 className="text-2xl">Icon component</h1>
      <p className="my-4">
        Those components are sourced from{' '}
        <a href="https://heroicons.com/" className="text-ds-blue">
          https://heroicons.com/
        </a>
        . Unfortunately we don’t have a way to tree-shake so if you need to use
        a component that is not in this list but is on the heroicons website,{' '}
        you will need to open the file `svg/outline/index.js` or
        `svg/solid/index.js` and uncomment the icon you need.
      </p>
    </div>
  )
}

export const AllOutlineIcons = () => {
  const options = Object.keys(svgOutline)

  return (
    <>
      <Description />
      <div className="w-full flex flex-wrap">
        {options.map((iconName) => {
          return (
            <div
              key={iconName}
              className="p-3 center flex border border-gray-200"
            >
              <Icon name={iconName} variant="outline" />
              <p className="ml-2">{kebabCase(iconName)}</p>
            </div>
          )
        })}
      </div>
    </>
  )
}

export const AllSolidIcons = () => {
  const options = Object.keys(svgSolid)

  return (
    <>
      <Description />
      <div className="w-full flex flex-wrap">
        {options.map((iconName) => {
          return (
            <div
              key={iconName}
              className="p-3 center flex border border-gray-200"
            >
              <Icon name={iconName} variant="solid" />
              <p className="ml-2">{iconName}</p>
            </div>
          )
        })}
      </div>
    </>
  )
}

export const IconSize = () => {
  return (
    <>
      <h1 className="text-2xl">Icon size</h1>
      <br />
      <div className="flex mt-2 items-center">
        <Icon name="search" size="sm" />
        <p className="ml-4">Size = sm</p>
      </div>
      <div className="flex mt-2 items-center">
        <Icon name="search" size="md" />
        <p className="ml-4">Size = md</p>
      </div>
      <div className="flex mt-2 items-center">
        <Icon name="search" size="lg" />
        <p className="ml-4">Size = lg</p>
      </div>
    </>
  )
}

export default {
  title: 'Components/Icon',
  component: Icon,
}
