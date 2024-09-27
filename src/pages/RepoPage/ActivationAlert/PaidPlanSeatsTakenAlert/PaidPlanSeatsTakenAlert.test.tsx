import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import PaidPlanSeatsTakenAlert from './PaidPlanSeatsTakenAlert'

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/gazebo/new']}>
    <Route path="/:provider/:owner/:repo/new">{children}</Route>
  </MemoryRouter>
)

describe('PaidPlanSeatsTakenAlert', () => {
  it('renders the banner with correct heading', () => {
    render(<PaidPlanSeatsTakenAlert />, { wrapper })

    const bannerHeading = screen.getByRole('heading', {
      name: /Seats Limit Reached/,
    })
    expect(bannerHeading).toBeInTheDocument()
  })

  it('renders the banner with correct description', () => {
    render(<PaidPlanSeatsTakenAlert />, { wrapper })

    const description = screen.getByText(
      /Your organization has utilized all available seats on this plan/
    )
    expect(description).toBeInTheDocument()
  })

  it('renders the banner with correct link', () => {
    render(<PaidPlanSeatsTakenAlert />, { wrapper })

    const link = screen.getByRole('link', {
      name: /Increase seat count/,
    })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/plan/gh/codecov/upgrade')
  })

  it('renders the correct img', () => {
    render(<PaidPlanSeatsTakenAlert />, { wrapper })

    const img = screen.getByAltText('Forbidden')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute(
      'src',
      '/src/layouts/shared/NetworkErrorBoundary/assets/error-upsidedown-umbrella.svg'
    )
  })
})
