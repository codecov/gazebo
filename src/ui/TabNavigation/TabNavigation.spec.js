import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import TabNavigation from '.'

describe('TabNavigation', () => {
  function setup(component) {
    const location = '/gh/codecov'
    const props = {
      tabs: [
        { pageName: 'owner', children: 'Repos' },
        { pageName: 'accountAdmin', children: 'Settings' },
      ],
      component,
    }
    render(<TabNavigation {...props} />, {
      wrapper: (props) => (
        <MemoryRouter initialEntries={[location]}>
          <Switch>
            <Route path="/:provider/:owner" exact>
              {props.children}
              Repo list :)
            </Route>
            <Route path="/account/:provider/:owner">
              {props.children}
              Admin page :)
            </Route>
          </Switch>
        </MemoryRouter>
      ),
    })
  }

  describe('when rendered on the repo list', () => {
    it('renders the first tab with the right URL', () => {
      setup(undefined)
      expect(screen.queryAllByRole('link')[0]).toHaveAttribute(
        'href',
        '/gh/codecov'
      )
    })

    it('renders the second tab with the right URL', () => {
      setup(undefined)
      expect(screen.queryAllByRole('link')[1]).toHaveAttribute(
        'href',
        '/account/gh/codecov'
      )
    })

    it('renders a component if a component is provided', () => {
      setup(<div>Test Component 123</div>)
      expect(screen.getByText('Test Component 123')).toBeDefined()
    })

    it('does not render a component if a component is not provided', () => {
      setup(undefined)
      expect(screen.queryByText('Test Component 123')).toBeNull()
    })
  })
})
