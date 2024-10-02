import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import FreePlanSeatsTakenAlert from './FreePlanSeatsTakenAlert'

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/gazebo/new']}>
    <Route path="/:provider/:owner/:repo/new">{children}</Route>
  </MemoryRouter>
)

describe('FreePlanSeatsTakenAlert', () => {
  it('renders the banner with correct heading', () => {
    render(<FreePlanSeatsTakenAlert />, { wrapper })

    const bannerHeading = screen.getByRole('heading', {
      name: /Coverage Alert: All Seats Taken/,
    })
    expect(bannerHeading).toBeInTheDocument()
  })

  it('renders the banner with correct description', () => {
    render(<FreePlanSeatsTakenAlert />, { wrapper })

    const description = screen.getByText(
      /Your organization is on the Developer free plan/
    )
    expect(description).toBeInTheDocument()
  })

  it('renders the banner with correct link', () => {
    render(<FreePlanSeatsTakenAlert />, { wrapper })

    const link = screen.getByRole('link', {
      name: /View plan options/,
    })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/plan/gh/codecov')
  })

  it('renders the correct img', () => {
    render(<FreePlanSeatsTakenAlert />, { wrapper })

    const img = screen.getByAltText('Forbidden')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute(
      'src',
      '/src/layouts/shared/NetworkErrorBoundary/assets/error-upsidedown-umbrella.svg'
    )
  })
})
