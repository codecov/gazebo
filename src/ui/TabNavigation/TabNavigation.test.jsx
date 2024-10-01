import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import TabNavigation from './TabNavigation'

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov']}>
    <Switch>
      <Route path="/:provider/:owner" exact>
        {children}
        Repo list :)
      </Route>
      <Route path="/account/:provider/:owner">
        {children}
        Admin page :)
      </Route>
    </Switch>
  </MemoryRouter>
)

const tabs = [
  { pageName: 'owner', children: 'Repos' },
  { pageName: 'accountAdmin', children: 'Settings' },
]

describe('TabNavigation', () => {
  describe('when rendered on the repo list', () => {
    it('renders the first tab with the right URL', () => {
      render(<TabNavigation tabs={tabs} />, { wrapper })

      const link = screen.queryAllByRole('link')[0]
      expect(link).toHaveAttribute('href', '/gh/codecov')
    })

    it('renders the second tab with the right URL', () => {
      render(<TabNavigation tabs={tabs} />, { wrapper })

      const link = screen.queryAllByRole('link')[1]
      expect(link).toHaveAttribute('href', '/account/gh/codecov')
    })

    it('renders a component if a component is provided', () => {
      render(
        <TabNavigation tabs={tabs} component={<div>Test Component 123</div>} />,
        { wrapper }
      )

      expect(screen.getByText('Test Component 123')).toBeDefined()
    })

    it('does not render a component if a component is not provided', () => {
      render(<TabNavigation tabs={tabs} />, { wrapper })
      expect(screen.queryByText('Test Component 123')).toBeNull()
    })
  })
})
