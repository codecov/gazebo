import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import Sidemenu from './Sidemenu'

const wrapper = ({ children }) => {
  return (
    <MemoryRouter initialEntries={['/account/gh/codecov']}>
      <Switch>
        <Route
          path={[
            '/account/:provider/:owner/access',
            '/account/:provider/:owner/billing',
            '/account/:provider/:owner/yaml',
            '/account/:provider/:owner',
          ]}
        >
          {children}
        </Route>
      </Switch>
    </MemoryRouter>
  )
}

const props = {
  links: [
    { pageName: 'accountAdmin', exact: true },
    { pageName: 'billingAndUsers' },
    { pageName: 'internalAccessTab' },
    { pageName: 'yamlTab', children: 'Global Yaml' },
  ],
}

describe('Sidemenu', () => {
  describe('when rendered on the admin', () => {
    it('renders the first tab with the right URL', () => {
      render(<Sidemenu {...props} />, {
        wrapper,
      })

      const firstLink = screen.queryAllByRole('link')[0]
      expect(firstLink).toHaveAttribute('href', '/account/gh/codecov')
    })

    it('renders the second tab with the right URL', () => {
      render(<Sidemenu {...props} />, {
        wrapper,
      })

      const secondLink = screen.queryAllByRole('link')[1]
      expect(secondLink).toHaveAttribute('href', '/account/gh/codecov/billing')
    })
  })
})
