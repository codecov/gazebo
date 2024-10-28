import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import Header from './Header'

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/']}>
    <Route path="/" exact>
      {children}
    </Route>
  </MemoryRouter>
)

describe('Header', () => {
  it('renders the header', () => {
    render(<Header />, { wrapper })

    const link = screen.getByText(/Link to Homepage/)
    expect(link).toBeInTheDocument()
  })

  it('renders the docs link', () => {
    render(<Header />, { wrapper })

    const link = screen.getByText(/Docs/)
    expect(link).toBeInTheDocument()
  })

  it('renders the support link', () => {
    render(<Header />, { wrapper })

    const link = screen.getByText(/Support/)
    expect(link).toBeInTheDocument()
  })

  it('renders the blog link', () => {
    render(<Header />, { wrapper })

    const link = screen.getByText(/Blog/)
    expect(link).toBeInTheDocument()
  })
})
