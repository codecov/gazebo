import { render, screen } from 'custom-testing-library'

import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter, Route, useParams } from 'react-router-dom'

import {
  useActivateFlagMeasurements,
  useRepoBackfilled,
} from 'services/repo/hooks'

import FlagsBanner from './FlagsBanner'

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

describe('FlagsBanner', () => {
  const mutate = jest.fn()
  function setup(data) {
    useParams.mockReturnValue({
      owner: 'codecov',
      provider: 'gh',
      repo: 'gazebo',
    })
    useRepoBackfilled.mockReturnValue(data)
    useActivateFlagMeasurements.mockReturnValue({ mutate })

    render(
      <MemoryRouter initialEntries={['/gh/codecov/gazebo/flags']}>
        <Route path="/:provider/:owner/:repo/flags" exact={true}>
          <QueryClientProvider client={queryClient}>
            <FlagsBanner />
          </QueryClientProvider>
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered with empty data', () => {
    beforeEach(() => {
      setup({})
    })

    it('does not renders banner content', () => {
      expect(
        screen.queryByText(
          'You need to enable Flag analytics to see coverage data'
        )
      ).not.toBeInTheDocument()
    })
  })

  describe('when there are not any active flag measurements', () => {
    beforeEach(() => {
      setup({ data: { flagsMeasurementsActive: false } })
    })

    it('renders header and table components', () => {
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
      })
    })
  })

  describe('when there are active flag measurements but not backfilled datasets', () => {
    beforeEach(() => {
      setup({
        data: {
          flagsMeasurementsActive: true,
          flagsMeasurementsBackfilled: false,
        },
      })
    })

    it('renders header and table components', () => {
      expect(screen.getByText('Pulling historical data')).toBeInTheDocument()
      expect(
        screen.getByText(
          'We are pulling in all of your historical flags data, this can sometimes take awhile. This page will update once complete, feel free to navigate away in the meantime.'
        )
      ).toBeInTheDocument()
    })
  })

  describe('when repo datasets are both active and backfilled', () => {
    beforeEach(() => {
      setup({
        data: {
          flagsMeasurementsActive: true,
          flagsMeasurementsBackfilled: true,
        },
      })
    })

    it('renders header and table components', () => {
      expect(
        screen.queryByText('Pulling historical data')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText(
          'You need to enable Flag analytics to see coverage data'
        )
      ).not.toBeInTheDocument()
    })
  })
})
