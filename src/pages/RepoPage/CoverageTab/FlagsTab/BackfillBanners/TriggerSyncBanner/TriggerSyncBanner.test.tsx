import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import TriggerSyncBanner from './TriggerSyncBanner'

const mocks = vi.hoisted(() => ({
  useActivateMeasurements: vi.fn(),
  useParams: vi.fn(),
}))

vi.mock('services/user')

vi.mock('services/repo', async () => {
  const actual = await vi.importActual('services/repo')
  return {
    ...actual,
    useActivateMeasurements: mocks.useActivateMeasurements,
  }
})
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom') // import and retain the original functionalities
  return {
    ...actual,
    useParams: mocks.useParams,
  }
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/gazebo/flags']}>
    <Route path="/:provider/:owner/:repo/flags" exact={true}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

describe('TriggerSyncBanner', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  function setup() {
    const user = userEvent.setup()
    const mutate = vi.fn()

    mocks.useParams.mockReturnValue({
      owner: 'codecov',
      provider: 'gh',
      repo: 'gazebo',
    })
    mocks.useActivateMeasurements.mockReturnValue({ mutate })

    return { mutate, user }
  }

  describe('when rendered', () => {
    it('renders heading and content components', () => {
      setup()
      render(<TriggerSyncBanner />, { wrapper })

      expect(
        screen.getByText(
          'You need to enable Flag analytics to see coverage data'
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'Flag analytics is disabled by default. Enable this feature below to see all your historical coverage data and coverage trend for each flag.'
        )
      ).toBeInTheDocument()
      expect(screen.getByText('Enable flag analytics')).toBeInTheDocument()
    })

    describe('when clicking on the button to upgrade', () => {
      it('calls the mutate function', async () => {
        const { mutate, user } = setup()
        render(<TriggerSyncBanner />, { wrapper })

        const backfill = screen.getByTestId('backfill-task')
        await user.click(backfill)

        expect(mutate).toHaveBeenCalled()
      })
    })
  })
})
