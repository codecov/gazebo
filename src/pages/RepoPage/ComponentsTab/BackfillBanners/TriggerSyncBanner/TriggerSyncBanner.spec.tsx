import { render, screen } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { PropsWithChildren } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import TriggerSyncBanner from './TriggerSyncBanner'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const wrapper: React.FC<PropsWithChildren> = ({ children }) => (
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
  afterEach(() => jest.resetAllMocks())

  function setup() {
    const user = userEvent.setup()
    const mutate = jest.fn()

    server.use(
      graphql.mutation('ActivateMeasurements', (req, res, ctx) => {
        mutate(req.variables)
        return res(ctx.status(200), ctx.data({}))
      })
    )
    return { mutate, user }
  }

  describe('when rendered', () => {
    it('renders heading and content components', () => {
      setup()
      render(<TriggerSyncBanner />, { wrapper })

      const enableAnalyticsText = screen.getByText(
        'You need to enable Component analytics to see coverage data'
      )
      expect(enableAnalyticsText).toBeInTheDocument()
      expect(
        screen.getByText(
          'Component analytics is disabled by default. Enable this feature below to see all your historical coverage data and coverage trend for each component.'
        )
      ).toBeInTheDocument()
      expect(screen.getByText('Enable component analytics')).toBeInTheDocument()
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
