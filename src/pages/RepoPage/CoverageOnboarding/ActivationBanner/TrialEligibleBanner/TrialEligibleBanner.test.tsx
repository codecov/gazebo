import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import TrialEligibleBanner from './TrialEligibleBanner'

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

describe('TrialEligibleBanner', () => {
  function setup() {
    const mockTrialMutationVariables = vi.fn()
    const user = userEvent.setup()
    server.use(
      graphql.mutation('startTrial', (info) => {
        mockTrialMutationVariables(info?.variables)

        return HttpResponse.json({ data: { startTrial: null } })
      })
    )

    return { mockTrialMutationVariables, user }
  }

  it('renders the banner with correct content', () => {
    setup()
    render(<TrialEligibleBanner />, { wrapper })

    const bannerHeading = screen.getByRole('heading', {
      name: /start a free 14-day trial on pro team plan/i,
    })
    expect(bannerHeading).toBeInTheDocument()

    const list = screen.getByText(/Unlimited members/i)
    expect(list).toBeInTheDocument()
  })

  it('renders correct links', () => {
    setup()
    render(<TrialEligibleBanner />, { wrapper })

    const upgradeLink = screen.getByRole('link', { name: /upgrade/ })
    expect(upgradeLink).toBeInTheDocument()
    expect(upgradeLink).toHaveAttribute('href', '/plan/gh/codecov/upgrade')

    const manageMembersLink = screen.getByRole('link', {
      name: /manage members/,
    })
    expect(manageMembersLink).toBeInTheDocument()
    expect(manageMembersLink).toHaveAttribute('href', '/members/gh/codecov')
  })

  it('calls the start trial function when the "Start Trial" button is clicked', async () => {
    const { mockTrialMutationVariables, user } = setup()
    render(<TrialEligibleBanner />, { wrapper })

    const startTrialButton = screen.getByRole('button', {
      name: /Start Trial/,
    })
    await user.click(startTrialButton)

    await waitFor(() =>
      expect(mockTrialMutationVariables).toHaveBeenCalledWith({
        input: { orgUsername: 'codecov' },
      })
    )
  })
})
