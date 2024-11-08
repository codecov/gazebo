import { type Meta, type StoryObj } from '@storybook/react'
import { MemoryRouter, Route } from 'react-router-dom'

import ContextSwitcher from './ContextSwitcher'

<<<<<<< HEAD:src/ui/ContextSwitcher/ContextSwitcher.stories.jsx
const Template = (args) => (
  <MemoryRouter initialEntries={['/gh/codecov']}>
    <Route path="/:provider/:owner">
      <ContextSwitcher {...args} />
    </Route>
  </MemoryRouter>
)
=======
const meta: Meta<typeof ContextSwitcher> = {
  title: 'Components/ContextSwitcher',
  component: ContextSwitcher,
}

export default meta

type Story = StoryObj<typeof ContextSwitcher>
>>>>>>> eebb37c1b (refactor: Convert ContextSwitcher to TS):src/ui/ContextSwitcher/ContextSwitcher.stories.tsx

const contexts = [
  {
    owner: {
      username: 'dorianamouroux',
      avatarUrl: 'https://github.com/dorianamouroux.png?size=40',
    },
    pageName: 'provider',
  },
  {
    owner: {
      username: 'spotify',
      avatarUrl: 'https://github.com/spotify.png?size=40',
    },
    pageName: 'owner',
  },
  {
    owner: {
      username: 'codecov',
      avatarUrl: 'https://github.com/codecov.png?size=40',
    },
    pageName: 'owner',
  },
]

export const SimpleContextSwitcher: Story = {
  args: {
    activeContext: { avatarUrl: '', username: 'dorianamouroux' },
    contexts,
  },
  render: (args) => (
    <MemoryRouter initialEntries={['/gh/codecov']}>
      <Route path="/:provider/">
        <ContextSwitcher {...args} />
      </Route>
    </MemoryRouter>
  ),
}
