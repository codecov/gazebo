import { type Meta, type StoryObj } from '@storybook/react'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import TabNavigation from './TabNavigation'

const meta: Meta<typeof TabNavigation> = {
  title: 'Components/TabNavigation',
  component: TabNavigation,
}

export default meta

type Story = StoryObj<typeof TabNavigation>

export const SimpleTabNavigation: Story = {
  args: {
    tabs: [
      { pageName: 'owner', children: 'Repos' },
      { pageName: 'accountAdmin', children: 'Settings' },
    ],
  },
  render: (args) => (
    <MemoryRouter initialEntries={['/gh/codecov']}>
      <Switch>
        <Route path="/:provider/:owner" exact>
          <TabNavigation {...args} />
          Repo list :)
        </Route>
        <Route path="/account/:provider/:owner">
          <TabNavigation {...args} />
          Admin page :)
        </Route>
      </Switch>
    </MemoryRouter>
  ),
}
