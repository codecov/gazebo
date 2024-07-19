import { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter, Route } from 'react-router-dom'

import ToggleHeader from './ToggleHeader'

type ToggleHeaderStory = React.ComponentProps<typeof ToggleHeader>

const meta: Meta<ToggleHeaderStory> = {
  title: 'Components/FileViewer/ToggleHeader',
  component: ToggleHeader,
  argTypes: {
    title: {
      description: 'The title of the file viewer',
      control: 'text',
    },
    sticky: {
      description: 'Whether the title should be sticky',
      control: 'boolean',
    },
    showHitCount: {
      description: 'Whether the hit count should be shown',
      control: 'boolean',
    },
    showFlagsSelect: {
      description:
        'Whether the flags select should be shown - **do not enable this unless you have a query provider**',
    },
    showComponentsSelect: {
      description:
        'Whether the components select should be shown - **do not enable this unless you have a query provider**',
    },
  },
}

export default meta

type Story = StoryObj<ToggleHeaderStory>

export const Default: Story = {
  args: {
    title: 'Super Cool Title',
  },
  render: (args) => (
    <MemoryRouter initialEntries={['/']}>
      <Route path="/">
        <ToggleHeader {...args} />
      </Route>
    </MemoryRouter>
  ),
}
