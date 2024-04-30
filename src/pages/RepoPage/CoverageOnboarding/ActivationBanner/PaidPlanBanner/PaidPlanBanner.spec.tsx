import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import PaidPlanBanner from './PaidPlanBanner'

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

describe('PaidPlanBanner', () => {
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
    render(<PaidPlanBanner />, { wrapper })

    const bannerHeading = screen.getByRole('heading', {
      name: /All Seats Taken/,
    })
    expect(bannerHeading).toBeInTheDocument()

    const description = screen.getByText(
      /Your organization is on the Developer free plan/i
    )
    expect(description).toBeInTheDocument()
  })

  it('renders correct links', () => {
    setup()
    render(<PaidPlanBanner />, { wrapper })

    const upgradeLink = screen.getByRole('link', { name: /Upgrade/ })
    expect(upgradeLink).toBeInTheDocument()

    const manageMembersLink = screen.getByRole('link', {
      name: /manage members/,
    })
    expect(manageMembersLink).toBeInTheDocument()
  })
})
