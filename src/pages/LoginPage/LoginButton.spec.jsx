import { render, screen } from '@testing-library/react'
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
    render(<LoginButton provider="gh" />, { wrapper: wrapper() })

    const github = screen.getByText(/Login with GitHub/i)
    expect(github).toBeInTheDocument()
  })
  it('GitLab: renders the login button', () => {
    render(<LoginButton provider="gl" />, { wrapper: wrapper() })

    const gitlab = screen.getByText(/Login with GitLab/i)
    expect(gitlab).toBeInTheDocument()
  })
})
