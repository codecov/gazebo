

import { render, screen } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, useParams } from 'react-router-dom'

import { useActivateFlagMeasurements } from 'services/repo/hooks'
import { trackSegmentEvent } from 'services/tracking/segment'
import { useUser } from 'services/user'

import TriggerSyncBanner from './TriggerSyncBanner'

jest.mock('services/tracking/segment')
jest.mock('services/user')

jest.mock('services/repo/hooks')
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

const user = {
  username: 'codecov',
  trackingMetadata: {
    ownerid: 4,
  },
}

describe('TriggerSyncBanner', () => {
  const mutate = jest.fn()
  function setup() {
    useParams.mockReturnValue({
      owner: 'codecov',
      provider: 'gh',
      repo: 'gazebo',
    })
    useUser.mockReturnValue({ data: user })
    useActivateFlagMeasurements.mockReturnValue({ mutate })

    render(
      <MemoryRouter initialEntries={['/gh/codecov/gazebo/flags']}>
        <Route path="/:provider/:owner/:repo/flags" exact={true}>
          <QueryClientProvider client={queryClient}>
            <TriggerSyncBanner />
          </QueryClientProvider>
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('renders heading and content components', () => {
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
      beforeEach(() => {
        userEvent.click(screen.getByTestId('backfill-task'))
      })

      it('calls the mutate function', () => {
        expect(mutate).toHaveBeenCalledWith({
          provider: 'gh',
          repo: 'gazebo',
          owner: 'codecov',
        })
        expect(trackSegmentEvent).toHaveBeenCalledWith({
          data: { repoName: 'gazebo', userId: 4 },
          event: 'Flags Analytics Enabled',
        })
      })
    })
  })
})
