import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import ActivationRequiredBanner from './ActivationRequiredBanner'

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/gazebo/new']}>
    <Route path="/:provider/:owner/:repo/new">{children}</Route>
  </MemoryRouter>
)

describe('ActivationRequiredBanner', () => {
  it('renders the banner with correct content', () => {
    render(<ActivationRequiredBanner />, { wrapper })

    const bannerHeading = screen.getByRole('heading', {
      name: /Activation Required/,
    })
    expect(bannerHeading).toBeInTheDocument()

    const description = screen.getByText(
      /You have available seats, but activation is needed./
    )
    expect(description).toBeInTheDocument()
  })

  it('renders correct links', () => {
    render(<ActivationRequiredBanner />, { wrapper })

    const manageMembersLink = screen.getByRole('link', {
      name: /Manage Members/,
    })
    expect(manageMembersLink).toBeInTheDocument()
    expect(manageMembersLink).toHaveAttribute('href', '/members/gh/codecov')
  })
})
