import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import UnauthorizedAccess from './UnauthorizedAccess'

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/repo']}>
    <Route path="/:provider/:owner/:repo">{children}</Route>
  </MemoryRouter>
)

describe('UnauthorizedAccess', () => {
  it('renders the title', () => {
    render(<UnauthorizedAccess />, { wrapper })

    const title = screen.getByText(/Unauthorized Access/)
    expect(title).toBeInTheDocument()
  })

  it('renders the link to members page', () => {
    render(<UnauthorizedAccess />, { wrapper })

    const link = screen.getByRole('link', { name: /click here/ })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/members/gh/codecov')
  })

  it('renders error status', () => {
    render(<UnauthorizedAccess />, { wrapper })

    const status = screen.getByText(/Error 401/)
    expect(status).toBeInTheDocument()
  })
})
