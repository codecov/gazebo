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
    </Switch>
  </MemoryRouter>
)

export const SimpleTabNavigation = Template.bind({})
SimpleTabNavigation.args = {
  tabs: [
    { pageName: 'ownerInternal', children: 'Repos' },
    { pageName: 'accountAdmin', children: 'Settings' },
  ],
}

export default {
  title: 'Components/TabNavigation',
  component: TabNavigation,
}
