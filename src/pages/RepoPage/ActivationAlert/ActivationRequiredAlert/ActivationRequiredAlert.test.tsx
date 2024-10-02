import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import ActivationRequiredAlert from './ActivationRequiredAlert'

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/gazebo/new']}>
    <Route path="/:provider/:owner/:repo/new">{children}</Route>
  </MemoryRouter>
)

describe('ActivationRequiredAlert', () => {
  it('renders the banner with correct heading', () => {
    render(<ActivationRequiredAlert />, { wrapper })

    const bannerHeading = screen.getByRole('heading', {
      name: /Activation Required/,
    })
    expect(bannerHeading).toBeInTheDocument()
  })

  it('renders the banner with correct description', () => {
    render(<ActivationRequiredAlert />, { wrapper })

    const description = screen.getByText(
      /You have available seats, but activation is needed./
    )
    expect(description).toBeInTheDocument()
  })

  it('renders the banner with correct link', () => {
    render(<ActivationRequiredAlert />, { wrapper })

    const link = screen.getByRole('link', {
      name: /Manage members/,
    })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/members/gh/codecov')
  })

  it('renders the correct img', () => {
    render(<ActivationRequiredAlert />, { wrapper })

    const img = screen.getByAltText('Forbidden')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute(
      'src',
      '/src/layouts/shared/NetworkErrorBoundary/assets/error-upsidedown-umbrella.svg'
    )
  })
})
