import { render, screen } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter, Route, useParams } from 'react-router-dom'

import { useRepoBackfilled } from 'services/repo/hooks'

import FlagsTab from './FlagsTab'

jest.mock(
  './TriggerSyncBanner/TriggerSyncBanner.js',
  () => () => 'Trigger Sync Banner'
)
jest.mock('./SyncingBanner/SyncingBanner.js', () => () => 'Syncing Banner')
jest.mock('./subroute/FlagsTable/FlagsTable', () => () => 'Flags table')

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

describe('Flags Tab', () => {
  function setup(data) {
    useParams.mockReturnValue({
      owner: 'codecov',
      provider: 'gh',
      repo: 'gazebo',
    })

    useRepoBackfilled.mockReturnValue(data)
    render(
      <MemoryRouter initialEntries={['/gh/codecov/gazebo/flags']}>
        <Route path="/:provider/:owner/:repo/flags" exact={true}>
          <QueryClientProvider client={queryClient}>
            <FlagsTab />
          </QueryClientProvider>
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered without active or backfilled repo', () => {
    beforeEach(() => {
      setup({
        data: {
          flagsMeasurementsActive: false,
          flagsMeasurementsBackfilled: false,
        },
      })
    })

    it('renders header and table components', () => {
      expect(screen.getByText(/Flags Header Component/)).toBeInTheDocument()
      expect(screen.getByText(/Trigger Sync Banner/)).toBeInTheDocument()
      expect(screen.queryByText(/Syncing Banner/)).not.toBeInTheDocument()
    })
  })

  describe('when rendered while ongoing syncing', () => {
    beforeEach(() => {
      setup({
        data: {
          flagsMeasurementsActive: true,
          flagsMeasurementsBackfilled: false,
        },
      })
    })

    it('renders header and table components', () => {
      expect(screen.getByText(/Flags Header Component/)).toBeInTheDocument()
      expect(screen.getByText(/Syncing Banner/)).toBeInTheDocument()
      expect(screen.queryByText(/Trigger Sync Banner/)).not.toBeInTheDocument()
    })
  })

  describe('when rendered with backfilled repo', () => {
    beforeEach(() => {
      setup({
        data: {
          flagsMeasurementsActive: true,
          flagsMeasurementsBackfilled: true,
        },
      })
    })

    it('renders header and table components', () => {
      expect(screen.getByText(/Flags Header Component/)).toBeInTheDocument()
      expect(screen.queryByText(/Syncing Banner/)).not.toBeInTheDocument()
      expect(screen.queryByText(/Trigger Sync Banner/)).not.toBeInTheDocument()
    })
  })
})
