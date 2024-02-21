import { render, screen } from 'custom-testing-library'

import { QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import { queryClient } from 'pages/RepoPage/repo-jest-setup'

import InactiveRepo from './InactiveRepo'

const wrapper = ({ children }: { children: React.ReactElement }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov']}>
      <Route path="/:provider/:owner">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

describe('InactiveRepo', () => {
  it('renders "Deactivated" Text when not active', async () => {
    render(<InactiveRepo isActive owner="bob" />, { wrapper })

    const ctaText = await screen.findByText(/Deactivated/)
    expect(ctaText).toBeInTheDocument()
  })

  it('renders "Inactive" Text when not active and not part of organization', async () => {
    render(<InactiveRepo isActive={false} owner="bob" />, { wrapper })

    const ctaText = await screen.findByText(/Inactive/)
    expect(ctaText).toBeInTheDocument()
  })

  it('renders "Configure" Text when not active and part of organization', async () => {
    render(
      <InactiveRepo
        isActive={false}
        isCurrentUserPartOfOrg
        repoName="coolguy"
        owner="bob"
      />,
      { wrapper }
    )

    const ctaText = await screen.findByText(/Configure/)
    expect(ctaText).toBeInTheDocument()
    expect(ctaText).toHaveAttribute('href', '/gh/bob/coolguy/new')
  })
})
