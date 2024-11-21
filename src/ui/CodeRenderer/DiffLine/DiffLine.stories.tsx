import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router-dom'

import DiffLineComponent from './DiffLine'

const line = [
  { types: ['keyword'], content: 'function' },
  { types: ['plain'], content: ' ' },
  { types: ['function'], content: 'add' },
  { types: ['punctuation'], content: '(' },
  { types: ['parameter'], content: 'a' },
  { types: ['parameter', 'punctuation'], content: ',' },
  { types: ['parameter'], content: ' b' },
  { types: ['punctuation'], content: ')' },
  { types: ['plain'], content: ' ' },
  { types: ['punctuation'], content: '{' },
  { types: ['plain'], content: '' },
]

const meta: Meta<typeof DiffLineComponent> = {
  title: 'Components/CodeRenderer/DiffLine',
  component: DiffLineComponent,
  argTypes: {
    baseCoverage: {
      options: ['H', 'P', 'M'],
      control: 'radio',
    },
    headCoverage: {
      options: ['H', 'P', 'M'],
      control: 'radio',
    },
  },
}

export default meta

type Story = StoryObj<typeof DiffLineComponent>

export const DiffLine: Story = {
  render: (args) => {
    return (
      <MemoryRouter initialEntries={['/']}>
        <DiffLineComponent
          {...args}
          lineContent={line}
          getTokenProps={({ token, key }) => ({
            children: token.content,
            key,
          })}
        />
      </MemoryRouter>
    )
  },
}
