import Sidemenu from './Sidemenu'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

const Template = (args) => (
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
)

export const SimpleSidemenu = Template.bind({})
SimpleSidemenu.args = {
  links: [
    { pageName: 'accountAdmin', exact: true },
    { pageName: 'billingAndUsers' },
    { pageName: 'internalAccessTab' },
    { pageName: 'yamlTab', children: 'Global Yaml' },
  ],
}

export default {
  title: 'Components/Sidemenu',
  component: Sidemenu,
}
