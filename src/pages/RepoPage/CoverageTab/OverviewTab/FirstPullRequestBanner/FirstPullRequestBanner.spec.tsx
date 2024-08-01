import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import FirstPullRequestBanner from './FirstPullRequestBanner'

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/gazebo']}>
    <Route path="/:provider/:owner/:repo">{children}</Route>
  </MemoryRouter>
)

describe('FirstPullRequestBanner', () => {
  it('renders content', () => {
    render(<FirstPullRequestBanner />, { wrapper })
    const content = screen.getByText(
      'Once merged to your default branch, Codecov will show your report results on this dashboard.'
    )
    expect(content).toBeInTheDocument()
  })

  it('renders the correct link', () => {
    render(<FirstPullRequestBanner />, { wrapper })
    const link = screen.getByRole('link', { name: 'edit default branch' })
    expect(link).toHaveAttribute('href', '/gh/codecov/gazebo/config')
  })
})
