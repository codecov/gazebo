import { render, screen } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PropsWithChildren } from 'react'
import { MemoryRouter, Route, useParams } from 'react-router-dom'

import { useActivateFlagMeasurements } from 'services/repo'

import TriggerSyncBanner from './TriggerSyncBanner'

jest.mock('services/user')

jest.mock('services/repo/useActivateFlagMeasurements')
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // import and retain the original functionalities
  useParams: jest.fn(() => {}),
}))

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

describe('TriggerSyncBanner', () => {
  afterEach(() => jest.resetAllMocks())

  function setup() {
    const user = userEvent.setup()
    const mutate = jest.fn()

    const mockedUseParams = useParams as jest.Mock
    const mockedUseActivateComponentMeasurements =
      useActivateFlagMeasurements as jest.Mock

    mockedUseParams.mockReturnValue({
      owner: 'codecov',
      provider: 'gh',
      repo: 'gazebo',
    })
    mockedUseActivateComponentMeasurements.mockReturnValue({ mutate })

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

        await waitFor(() => expect(mutate).toHaveBeenCalled())
      })
    })
  })
})
