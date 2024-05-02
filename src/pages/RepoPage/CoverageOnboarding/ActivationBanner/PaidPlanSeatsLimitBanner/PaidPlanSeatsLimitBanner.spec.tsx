import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import PaidPlanSeatsLimitBanner from './PaidPlanSeatsLimitBanner'

const queryClient = new QueryClient()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/gazebo/new']}>
      <Route path="/:provider/:owner/:repo/new">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

const server = setupServer()

beforeAll(() => {
  server.listen()
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

describe('PaidPlanSeatsLimitBanner', () => {
  function setup() {
    const mockTrialMutationVariables = jest.fn()
    const user = userEvent.setup()
    server.use(
      graphql.mutation('startTrial', (req, res, ctx) => {
        mockTrialMutationVariables(req?.variables)

        return res(ctx.status(200))
      })
    )

    return { mockTrialMutationVariables, user }
  }

  it('renders the banner with correct content', () => {
    setup()
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
    setup()
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
