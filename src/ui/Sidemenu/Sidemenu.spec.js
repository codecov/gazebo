import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import Sidemenu from '.'

describe('Sidemenu', () => {
  function setup() {
    const location = '/account/gh/codecov'
    const props = {
      links: [
        { pageName: 'accountAdmin', exact: true },
        { pageName: 'billingAndUsers' },
        { pageName: 'internalAccessTab' },
        { pageName: 'yamlTab', children: 'Global Yaml' },
      ],
    }
    render(<Sidemenu {...props} />, {
      wrapper: (props) => (
        <MemoryRouter initialEntries={[location]}>
          <Switch>
            <Route path="/account/:provider/:owner" exact>
              {props.children}
            </Route>
            <Route path="/account/:provider/:owner/billing" exact>
              {props.children}
            </Route>
            <Route path="/account/:provider/:owner/access" exact>
              {props.children}
            </Route>
            <Route path="/account/:provider/:owner/yaml" exact>
              {props.children}
            </Route>
          </Switch>
        </MemoryRouter>
      ),
    })
  }

  describe('when rendered on the admin', () => {
    beforeEach(setup)

    it('renders the first tab with the right URL', () => {
      expect(screen.queryAllByRole('link')[0]).toHaveAttribute(
        'href',
        '/account/gh/codecov'
      )
    })

    it('renders the second tab with the right URL', () => {
      expect(screen.queryAllByRole('link')[1]).toHaveAttribute(
        'href',
        '/account/gh/codecov/billing'
      )
    })
  })
})
