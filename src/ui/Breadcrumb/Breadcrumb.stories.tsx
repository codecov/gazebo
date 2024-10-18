import { createBrowserHistory } from 'history'
import { Route, Router, Switch } from 'react-router-dom'

import Breadcrumb from './Breadcrumb'

const history = createBrowserHistory()

const Template = (args) => {
  return (
    <Router history={history}>
      <Switch>
        <Route path="*">
          <Breadcrumb {...args} />
        </Route>
      </Switch>
    </Router>
  )
}

export const DefaultBreadcrumb = Template.bind({})
DefaultBreadcrumb.args = {
  paths: [
    { pageName: 'repo', text: 'bells hells' },
    { pageName: 'provider', text: 'laudna' },
    { pageName: '', readOnly: true, text: 'Pate' },
  ],
}

export default {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
}
