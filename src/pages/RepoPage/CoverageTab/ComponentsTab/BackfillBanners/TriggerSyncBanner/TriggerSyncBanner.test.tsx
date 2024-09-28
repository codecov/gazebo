import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'

import TriggerSyncBanner from './TriggerSyncBanner'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/gazebo/components']}>
    <Route path="/:provider/:owner/:repo/components" exact={true}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
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

describe('TriggerSyncBanner', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  function setup() {
    const user = userEvent.setup()
    const mutate = vi.fn()

    server.use(
      graphql.mutation('ActivateMeasurements', (info) => {
        mutate(info.variables)
        return HttpResponse.json({ data: { activateMeasurements: null } })
      })
    )
    return { mutate, user }
  }

  describe('when rendered', () => {
    it('renders heading and content components', () => {
      setup()
      render(<TriggerSyncBanner />, { wrapper })
      expect(screen.getByText('No data to display')).toBeInTheDocument()
      const enableAnalyticsText = screen.getByText(
        'To view related coverage data',
        { exact: false }
      )
      expect(enableAnalyticsText).toBeInTheDocument()
      expect(enableAnalyticsText.textContent).toEqual(
        'To view related coverage data, please click the Enable component analytics button below.'
      )
      const enableComponentButton = screen.getByRole('button', {
        name: 'Enable component analytics',
      })
      expect(enableComponentButton).toBeInTheDocument()
    })

    describe('when clicking on the button to upgrade', () => {
      it('calls the mutate function', async () => {
        const { mutate, user } = setup()
        render(<TriggerSyncBanner />, { wrapper })

        const backfill = screen.getByTestId('backfill-task')
        await user.click(backfill)

        await waitFor(() =>
          expect(mutate).toHaveBeenCalledWith({
            input: {
              measurementType: 'COMPONENT_COVERAGE',
              owner: 'codecov',
              repoName: 'gazebo',
            },
          })
        )
      })
    })
  })
})
