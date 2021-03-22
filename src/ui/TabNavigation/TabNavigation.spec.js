import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Switch } from 'react-router-dom'
import TabNavigation from '.'

describe('TabNavigation', () => {
  function setup() {
    const location = '/gh/codecov'
    const props = {
      tabs: [
        { pageName: 'ownerInternal', children: 'Repos' },
        { pageName: 'accountAdmin', children: 'Settings' },
      ],
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
    beforeEach(setup)

    it('renders the first tab with the right URL', () => {
      expect(screen.queryAllByRole('link')[0]).toHaveAttribute(
        'href',
        '/gh/codecov'
      )
    })

    it('renders the second tab with the right URL', () => {
      expect(screen.queryAllByRole('link')[1]).toHaveAttribute(
        'href',
        '/account/gh/codecov'
      )
    })
  })
})
