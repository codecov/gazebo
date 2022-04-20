import kebabCase from 'lodash/kebabCase'

import Icon from './Icon'
import * as svgDeveloper from './svg/developer'
import * as svgOutline from './svg/outline'
import * as svgSolid from './svg/solid'

function Description() {
  return (
    <div>
      <h1 className="text-2xl">Icon component</h1>
      <p className="my-4">
        Those components are sourced from{' '}
        <a
          href="https://heroicons.com/"
          target="_blank"
          rel="noreferrer"
          className="text-ds-blue"
        >
          https://heroicons.com/
        </a>{' '}
        and{' '}
        <a
          href="https://gitlab-org.gitlab.io/gitlab-svgs/"
          target="_blank"
          rel="noreferrer"
          className="text-ds-blue"
        >
          https://gitlab-org.gitlab.io/gitlab-svgs/
        </a>
        . Unfortunately we don’t have a way to tree-shake so if you need to use
        a component that is not in this list but is on the heroicons website,{' '}
        you will need to open the file `svg/outline/index.js` or
        `svg/solid/index.js` and uncomment the icon you need.
      </p>
    </div>
  )
}

export const AllOutlineIcons = (args) => {
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
              <Icon name={iconName} {...args} />
              <p className="ml-2">{kebabCase(iconName)}</p>
            </div>
          )
        })}
      </div>
    </>
  )
}
AllOutlineIcons.args = {
  variant: 'outline',
  size: 'sm',
}

export const AllSolidIcons = (args) => {
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
              <Icon name={iconName} {...args} />
              <p className="ml-2">{iconName}</p>
            </div>
          )
        })}
      </div>
    </>
  )
}
AllSolidIcons.args = {
  variant: 'solid',
  size: 'sm',
}

export const AllDeveloperIcons = (args) => {
  const options = Object.keys(svgDeveloper)

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
              <Icon name={iconName} {...args} />
              <p className="ml-2">{kebabCase(iconName)}</p>
            </div>
          )
        })}
      </div>
    </>
  )
}
AllDeveloperIcons.args = {
  variant: 'developer',
  size: 'sm',
}

export const IconSize = (args) => {
  return (
    <>
      <h1 className="text-2xl">Icon size</h1>
      <br />
      <div className="flex mt-2 items-center">
        <Icon name="search" size="sm" {...args} />
        <p className="ml-4">Size = sm</p>
      </div>
      <div className="flex mt-2 items-center">
        <Icon name="search" size="md" {...args} />
        <p className="ml-4">Size = md</p>
      </div>
      <div className="flex mt-2 items-center">
        <Icon name="search" size="lg" {...args} />
        <p className="ml-4">Size = lg</p>
      </div>
    </>
  )
}
IconSize.args = {
  variant: 'outline',
}

export default {
  title: 'Components/Icon',
  component: Icon,
  argTypes: {
    variant: {
      options: ['solid', 'outline', 'developer'],
      control: { type: 'select' },
    },
    size: {
      options: ['sm', 'md', 'lg'],
      control: { type: 'select' },
    },
  },
}
