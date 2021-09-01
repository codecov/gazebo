/* eslint-disable react/display-name */
import { useState } from 'react'
import PropTypes from 'prop-types'
import identity from 'lodash/identity'
import MultiSelect from './MultiSelect'

const Template = ({ renderItem, onChange, ...args }) => {
  const [value, setValue] = useState([])
  // Storybook doesn't process default function props correctly
  const functionArgs = { renderItem }
  if (renderItem === 'identity') functionArgs.renderItem = identity

  const onChangeHandler = (item) => {
    setValue(item)
    onChange(item)
  }

  return (
    <MultiSelect
      {...args}
      {...functionArgs}
      onChange={onChangeHandler}
      selectedItems={value}
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
  resourceName: 'flag',
  items: [`End-to-End`, `UI`, `Unit`],
  ariaName: 'Select flags to filter',
}

export default {
  title: 'Components/MultiSelect',
  component: MultiSelect,
  argTypes: {
    onChange: { action: 'onChange' },
  },
}
