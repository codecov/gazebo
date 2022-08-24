import identity from 'lodash/identity'
import PropTypes from 'prop-types'
import { useState } from 'react'

import MultipleSelect from './MultipleSelect'

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
    <MultipleSelect
      {...args}
      {...functionArgs}
      onChange={onChangeHandler}
      onSearch={(term) => console.log(term)}
      value={value}
      resourceName="item"
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
  items: [`Item1`, `Item2`, `Item3`],
}

export const SimpleSelectWithRenderItem = Template.bind({})
SimpleSelectWithRenderItem.args = {
  ...SimpleSelect.args,
  renderItem: (item) => <span>☂️ {item}</span>,
}

export const ComplexSelectRenderers = Template.bind({})
ComplexSelectRenderers.args = {
  ...SimpleSelect.args,
  items: [{ name: 'Item1' }, { name: 'Item2' }, { name: 'Item3' }],
  renderItem: (obj) => <span>🧛{obj.name}</span>,
  renderSelected: (obj) => <span>{obj.length} items selected</span>,
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
  onLoadMore: () => {
    console.log('Load more')
  },
}

export const SelectWithLoader = Template.bind({})
SelectWithLoader.args = {
  items: [`Item1`, `Item2`, `Item3`],
  isLoadingMore: true,
  onLoadMore: () => {
    console.log('Load more')
  },
}

export default {
  title: 'Components/MultipleSelect',
  component: MultipleSelect,
  argTypes: {
    onChange: { action: 'onChange' },
    onSearch: { action: 'onSearch' },
    onLoadMore: { action: 'onLoadMore' },
  },
}
