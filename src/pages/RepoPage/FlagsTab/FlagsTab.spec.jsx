import { render, screen } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, useParams } from 'react-router-dom'

import { useRepoBackfilled } from 'services/repo/hooks'
import { useRepoFlagsSelect } from 'services/repo/useRepoFlagsSelect'

import FlagsTab from './FlagsTab'

import { useLocationParams } from '../../../services/navigation'

jest.mock(
  './BackfillBanners/TriggerSyncBanner/TriggerSyncBanner.jsx',
  () => () => 'Trigger Sync Banner'
)
jest.mock(
  './BackfillBanners/SyncingBanner/SyncingBanner.jsx',
  () => () => 'Syncing Banner'
)
jest.mock('./subroute/FlagsTable/FlagsTable', () => () => 'Flags table')
jest.mock('./Header', () => ({ children }) => (
  <p>Flags Header Component {children}</p>
))

jest.mock('services/repo/hooks')
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // import and retain the original functionalities
  useParams: jest.fn(() => {}),
}))
jest.mock('services/navigation', () => ({
  ...jest.requireActual('services/navigation'),
  useLocationParams: jest.fn(),
}))

jest.mock('services/repo/useRepoFlagsSelect')

const flagsData = [
  {
    name: 'flag1',
  },
  {
    name: 'flag2',
  },
]

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

describe('Flags Tab', () => {
  const updateParams = jest.fn()

  function setup({ data, flags = flagsData }) {
    useParams.mockReturnValue({
      owner: 'codecov',
      provider: 'gh',
      repo: 'gazebo',
    })

    useRepoFlagsSelect.mockReturnValue({ data: flags })

    useLocationParams.mockReturnValue({
      params: { search: '' },
      updateParams: updateParams,
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
          data: {
            flagsMeasurementsActive: false,
            flagsMeasurementsBackfilled: false,
          },
        },
      })
    })

    it('renders header and table components', () => {
      expect(screen.getByText(/Flags Header Component/)).toBeInTheDocument()
      expect(screen.getByText(/Trigger Sync Banner/)).toBeInTheDocument()
      expect(screen.queryByText(/Syncing Banner/)).not.toBeInTheDocument()
    })

    it('renders a blurred image of the table', () => {
      const blurredFlagsTableImage = screen.getByRole('img', {
        name: /Blurred flags table/,
      })
      expect(blurredFlagsTableImage).toBeInTheDocument()
    })
  })

  describe('when rendered while ongoing syncing', () => {
    beforeEach(() => {
      setup({
        data: {
          data: {
            flagsMeasurementsActive: true,
            flagsMeasurementsBackfilled: false,
          },
        },
      })
    })

    it('renders header and table components', () => {
      expect(screen.getByText(/Flags Header Component/)).toBeInTheDocument()
      expect(screen.getByText(/Syncing Banner/)).toBeInTheDocument()
      expect(screen.queryByText(/Trigger Sync Banner/)).not.toBeInTheDocument()
    })

    it('renders a blurred image of the table', () => {
      const blurredFlagsTableImage = screen.getByRole('img', {
        name: /Blurred flags table/,
      })
      expect(blurredFlagsTableImage).toBeInTheDocument()
    })
  })

  describe('when rendered with backfilled repo', () => {
    beforeEach(() => {
      setup({
        data: {
          data: {
            flagsMeasurementsActive: true,
            flagsMeasurementsBackfilled: true,
          },
        },
      })
    })

    it('renders header and table components', () => {
      expect(screen.getByText(/Flags Header Component/)).toBeInTheDocument()
      expect(screen.queryByText(/Syncing Banner/)).not.toBeInTheDocument()
      expect(screen.queryByText(/Trigger Sync Banner/)).not.toBeInTheDocument()
    })
  })

  describe('when rendered with no flags', () => {
    beforeEach(() => {
      setup({
        data: {
          data: {
            flagsMeasurementsActive: false,
            flagsMeasurementsBackfilled: false,
          },
        },
        flags: [],
      })
    })

    it('renders empty state message', () => {
      expect(
        screen.getByText(/The Flags feature is not yet configured/)
      ).toBeInTheDocument()
    })
  })
})
