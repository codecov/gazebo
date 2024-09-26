import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import InactiveRepo from './InactiveRepo'

const queryClient = new QueryClient()
const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
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
