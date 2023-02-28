import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import Tabs from './Tabs'

const wrapper =
  (initialEntries = ['/plan/gh']) =>
  ({ children }) =>
    (
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/plan/:provider">{children}</Route>
      </MemoryRouter>
    )

describe('Tabs', () => {
  it('renders inactive repos tab', () => {
    render(<Tabs />, { wrapper: wrapper() })

    const repos = screen.getByRole('link', { name: 'Repos' })
    expect(repos).toBeInTheDocument()
    expect(repos).not.toHaveAttribute('aria-current', 'page')
  })
  it('renders active plan tab', () => {
    render(<Tabs />, { wrapper: wrapper() })

    const plan = screen.getByRole('link', { name: 'Plan' })
    expect(plan).toBeInTheDocument()
    expect(plan).toHaveAttribute('aria-current', 'page')
  })
})
