import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import LoginButton from './LoginButton'

const wrapper =
  (initialEntries = '/gh') =>
  ({ children }) =>
    (
      <MemoryRouter initialEntries={[initialEntries]}>
        <Switch>
          <Route path="/:provider" exact>
            <div>Click away</div>
            {children}
          </Route>
        </Switch>
      </MemoryRouter>
    )

describe('LoginButton', () => {
  it('BitBucket: renders the login button', () => {
    render(<LoginButton provider="bb" />, { wrapper: wrapper() })

    const bitbucket = screen.getByText(/Login with Bitbucket/i)
    expect(bitbucket).toBeInTheDocument()
  })
  it('GitHub: renders the login button', async () => {
    const user = userEvent.setup()
    render(<LoginButton provider="gh" />, { wrapper: wrapper() })

    const github = screen.getByText(/Login with GitHub/i)
    expect(github).toBeInTheDocument()

    let closedMenu = screen.getByRole('button', { expanded: false })
    expect(closedMenu).toBeInTheDocument()

    await user.click(closedMenu)

    const openMenu = screen.getByRole('button', { expanded: true })
    expect(openMenu).toBeInTheDocument()

    const allRepos = screen.getByText('All repos')
    expect(allRepos).toBeInTheDocument()
    const publicReposOnly = screen.getByText('Public repos only')
    expect(publicReposOnly).toBeInTheDocument()

    const clickAway = screen.getByText('Click away')
    expect(clickAway).toBeInTheDocument()

    await act(async () => await user.click(clickAway))

    closedMenu = screen.getByRole('button', { expanded: false })
    expect(openMenu).toBeInTheDocument()

    // Click away only works when open
    await act(async () => await user.click(clickAway))

    closedMenu = screen.getByRole('button', { expanded: false })
    expect(openMenu).toBeInTheDocument()
  })
  it('GitLab: renders the login button', () => {
    render(<LoginButton provider="gl" />, { wrapper: wrapper() })

    const gitlab = screen.getByText(/Login with GitLab/i)
    expect(gitlab).toBeInTheDocument()
  })
})
