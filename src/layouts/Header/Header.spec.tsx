import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import { useUser } from 'services/user'

import Header from './Header'

jest.mock('services/user')

const loggedInUser = {
  user: {
    username: 'p',
    avatarUrl: 'http://127.0.0.1/avatar-url',
  },
}

const wrapper: (initialEntries?: string) => React.FC<React.PropsWithChildren> =
  (initialEntries = '/gh') =>
  ({ children }) =>
    (
      <MemoryRouter initialEntries={[initialEntries]}>
        <Switch>
          <Route path="/:provider" exact>
            {children}
          </Route>
        </Switch>
      </MemoryRouter>
    )

describe('Header', () => {
  function setup() {
    const mockedUseUser = useUser as jest.Mock

    mockedUseUser.mockReturnValue({ data: loggedInUser })
  }

  it('renders the DesktopMenu', () => {
    setup()

    render(<Header />, { wrapper: wrapper() })
    const menu = screen.getByTestId('desktop-menu')
    expect(menu).toBeInTheDocument()
  })
})
