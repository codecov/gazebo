import TabNavigation from './TabNavigation'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

const Template = (args) => (
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
      <Route path="/:provider/:owner/:repo" exact>
        <TabNavigation {...args} />
        Overview
      </Route>
      <Route path="/:provider/:owner/:repo/commits">
        <TabNavigation {...args} />
        Commits
      </Route>
    </Switch>
  </MemoryRouter>
)

export const SimpleTabNavigation = Template.bind({})
SimpleTabNavigation.args = {
  tabs: [
    { pageName: 'owner', children: 'Repos' },
    { pageName: 'accountAdmin', children: 'Settings' },
  ],
}

export const disabledTabNavigation = Template.bind({})
disabledTabNavigation.args = {
  tabs: [
    { pageName: 'owner', children: 'Repos', disabled: true },
    { pageName: 'accountAdmin', children: 'Settings', disabled: false },
    { pageName: 'overview', children: 'Overview', disabled: true },
    { pageName: 'commits', children: 'Commits' },
  ],
}

export default {
  title: 'Components/TabNavigation',
  component: TabNavigation,
}
