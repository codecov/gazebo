import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen } from '@testing-library/react'
import React from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { eventTracker } from 'services/events/events'

import InactiveRepo from './InactiveRepo'

const queryClient = new QueryClient()
const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov']}>
      <Route path="/:provider/:owner">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

vi.mock('services/events/events')

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

  it('tracks a Button Clicked event when Configure is clicked', async () => {
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

    act(() => ctaText.click())

    expect(eventTracker().track).toHaveBeenCalledWith({
      type: 'Button Clicked',
      properties: {
        buttonType: 'Configure Repo',
        buttonLocation: 'Repo list',
      },
    })
  })
})
