import { type Meta, type StoryObj } from '@storybook/react'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import Sidemenu from './Sidemenu'

const meta: Meta<typeof Sidemenu> = {
  title: 'Components/Sidemenu',
  component: Sidemenu,
}

export default meta

type Story = StoryObj<typeof Sidemenu>

export const SimpleSidemenu: Story = {
  args: {
    links: [
      { pageName: 'accountAdmin' },
      { pageName: 'billingAndUsers' },
      { pageName: 'internalAccessTab' },
      { pageName: 'yamlTab', children: 'Global Yaml' },
    ],
  },
  render: (args) => (
    <MemoryRouter initialEntries={['/account/gh/codecov']}>
      <Switch>
        <Route path="/account/:provider/:owner" exact>
          <Sidemenu {...args} />
        </Route>
        <Route path="/account/:provider/:owner/billing" exact>
          <Sidemenu {...args} />
        </Route>
        <Route path="/account/:provider/:owner/access" exact>
          <Sidemenu {...args} />
        </Route>
        <Route path="/account/:provider/:owner/yaml" exact>
          <Sidemenu {...args} />
        </Route>
      </Switch>
    </MemoryRouter>
  ),
}
