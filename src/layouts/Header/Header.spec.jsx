import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import { useUser } from 'services/user'

import Header from './Header'

jest.mock('services/user')

const loggedInUser = {
  user: {
    username: 'p',
    avatarUrl: '',
  },
}

describe('Header', () => {
  function setup({ provider }) {
    useUser.mockReturnValue({ data: loggedInUser })

    render(
      <MemoryRouter initialEntries={[`/${provider}`]}>
        <Switch>
          <Route path="/:provider" exact>
            <Header />
          </Route>
        </Switch>
      </MemoryRouter>
    )
  }

  it('renders the DesktopMenu', () => {
    setup({ provider: 'gh' })
    const menu = screen.getByTestId('desktop-menu')
    expect(menu).toBeInTheDocument()
  })
})
