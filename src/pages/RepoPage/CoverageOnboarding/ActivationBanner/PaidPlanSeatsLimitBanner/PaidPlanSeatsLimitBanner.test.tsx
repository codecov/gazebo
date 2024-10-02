import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import PaidPlanSeatsLimitBanner from './PaidPlanSeatsLimitBanner'

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/gazebo/new']}>
    <Route path="/:provider/:owner/:repo/new">{children}</Route>
  </MemoryRouter>
)

describe('PaidPlanSeatsLimitBanner', () => {
  it('renders the banner with correct content', () => {
    render(<PaidPlanSeatsLimitBanner />, { wrapper })

    const bannerHeading = screen.getByRole('heading', {
      name: /Seats Limit Reached/,
    })
    expect(bannerHeading).toBeInTheDocument()

    const description = screen.getByText(
      /Your organization has utilized all available seats on this plan./i
    )
    expect(description).toBeInTheDocument()
  })

  it('renders correct links', () => {
    render(<PaidPlanSeatsLimitBanner />, { wrapper })

    const upgradeLink = screen.getByRole('link', { name: /Upgrade/ })
    expect(upgradeLink).toBeInTheDocument()
    expect(upgradeLink).toHaveAttribute('href', '/plan/gh/codecov/upgrade')

    const manageMembersLink = screen.getByRole('link', {
      name: /manage members/,
    })
    expect(manageMembersLink).toBeInTheDocument()
    expect(manageMembersLink).toHaveAttribute('href', '/members/gh/codecov')
  })
})
