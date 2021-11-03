import { render, screen } from '@testing-library/react'
import { MemoryRouter, Switch, Route } from 'react-router-dom'
import Header from './Header'
import { useUser } from 'services/user'

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
