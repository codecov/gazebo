/* eslint-disable react/display-name */
import identity from 'lodash/identity'
import PropTypes from 'prop-types'
import { useState } from 'react'

import Select from './Select'

const Template = ({ renderItem, renderSelected, onChange, ...args }) => {
  const [value, setValue] = useState()
  // Storybook doesn't process default function props correctly
  const functionArgs = { renderItem, renderSelected }
  if (renderItem === 'identity') functionArgs.renderItem = identity
  if (renderSelected === 'identity') functionArgs.renderSelected = identity

  const onChangeHandler = (item) => {
    setValue(item)
    onChange(item)
  }

  return (
    <Select
      {...args}
      {...functionArgs}
      onChange={onChangeHandler}
      value={value}
      ariaName="select dropdown"
    />
  )
}

Template.propTypes = {
  renderItem: PropTypes.func,
  renderSelected: PropTypes.func,
  onChange: PropTypes.func,
}

export const SimpleSelect = Template.bind({})
SimpleSelect.args = {
  ariaName: 'storybook select',
  items: [`Don't forget EQ`, `Yeehaw`, `Scarlett Dawn`],
}

export const SimpleSelectWithRenderItem = Template.bind({})
SimpleSelectWithRenderItem.args = {
  ...SimpleSelect.args,
  renderItem: (item, { isSelected, isHover, placeholder }) => (
    <span>
      {isSelected || isHover ? '👨🏼‍🎤' : '👩🏼‍🎤'} {item || placeholder}
    </span>
  ),
}

export const SimpleSelectWithRenderSelected = Template.bind({})
SimpleSelectWithRenderSelected.args = {
  ...SimpleSelect.args,
  renderSelected: (item, { placeholder }) => (
    <span>👨🏼‍🎤 {item || placeholder}</span>
  ),
}

export const ComplexSelectWithAll = Template.bind({})
ComplexSelectWithAll.args = {
  ...SimpleSelect.args,
  items: [
    { foo: 'Hello', bar: '!' },
    { foo: 'This', bar: 'Is' },
    { foo: 'An', bar: 'Example' },
  ],
  // eslint-disable-next-line react/display-name
  renderItem: (obj) => <span>Passed: {JSON.stringify(obj)}</span>,
  // eslint-disable-next-line react/display-name
  renderSelected: (obj) => <span>‍Passed: {JSON.stringify(obj)}</span>,
}

export const ComplexSelect = Template.bind({})
ComplexSelect.args = {
  ...SimpleSelect.args,
  items: [
    { foo: 'Hello', bar: '!' },
    { foo: 'This', bar: 'Is' },
    { foo: 'An', bar: 'Example' },
  ],
  // eslint-disable-next-line react/display-name
  renderItem: (obj) => <span>Passed: {JSON.stringify(obj)}</span>,
}

export const SelectWithLoadMore = Template.bind({})
SelectWithLoadMore.args = {
  ...SimpleSelect.args,
  items: [
    `Item1`,
    `Item2`,
    `Item3`,
    `Item4`,
    `Item5`,
    `Item6`,
    `Item7`,
    `Item8`,
    `Item9`,
    `Item10`,
    `Item11`,
    `Item12`,
    `Item13`,
    `Item14`,
    `Item15`,
    `Item16`,
  ],
}

export const SelectWithLoader = Template.bind({})
SelectWithLoader.args = {
  items: [`Item1`, `Item2`, `Item3`],
  isLoading: true,
}

export const SelectWithNoSearch = Template.bind({})
SelectWithNoSearch.args = {
  items: [`Item1`, `Item2`, `Item3`],
  onSearch: undefined,
}

export default {
  title: 'Components/NewSelect',
  component: Select,
  argTypes: {
    onChange: { action: 'onChange' },
    onSearch: { action: 'onSearch' },
    onLoadMore: { action: 'onLoadMore' },
  },
}
