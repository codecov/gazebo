import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import UnauthorizedRepoDisplay from './UnauthorizedRepoDisplay'

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/gazebo/new']}>
    <Route path="/:provider/:owner/:repo/new">{children}</Route>
  </MemoryRouter>
)

describe('UnauthorizedRepoDisplay', () => {
  it('renders the banner with correct heading', () => {
    render(<UnauthorizedRepoDisplay />, { wrapper })

    const bannerHeading = screen.getByRole('heading', {
      name: /Unauthorized/,
    })
    expect(bannerHeading).toBeInTheDocument()
  })

  it('renders the banner with correct description', () => {
    render(<UnauthorizedRepoDisplay />, { wrapper })

    const description = screen.getByText(
      /Activation is required to view this repo/
    )
    expect(description).toBeInTheDocument()
  })

  it('renders the banner with correct link', () => {
    render(<UnauthorizedRepoDisplay />, { wrapper })

    const link = screen.getByRole('link', {
      name: /click here to activate your account./,
    })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/members/gh/codecov')
  })

  it('renders the correct img', () => {
    render(<UnauthorizedRepoDisplay />, { wrapper })

    const img = screen.getByAltText('Forbidden')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute(
      'src',
      '/src/layouts/shared/NetworkErrorBoundary/assets/error-upsidedown-umbrella.svg'
    )
  })
})
