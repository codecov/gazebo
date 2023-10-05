import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useFlags } from 'shared/featureFlags'

import ToggleHeader from './ToggleHeader'

jest.mock('shared/featureFlags')
jest.mock('react-use/lib/useIntersection')

const mockFlagResponse = {
  owner: {
    repository: {
      flags: {
        edges: [
          {
            node: {
              name: 'flag-2',
            },
          },
        ],
        pageInfo: {
          hasNextPage: false,
          endCursor: null,
        },
      },
    },
  },
}

const mockBackfillResponse = {
  config: {
    isTimeScaleEnabled: true,
  },
  owner: {
    repository: {
      flagsMeasurementsActive: true,
      flagsMeasurementsBackfilled: true,
      flagsCount: 1,
    },
  },
}

const queryClient = new QueryClient()
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/cool-repo']}>
      <Route path="/:provider/:owner/:repo">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

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

describe('ToggleHeader', () => {
  function setup() {
    useFlags.mockReturnValue({
      coverageTabFlagMutliSelect: true,
    })

    server.use(
      graphql.query('BackfillFlagMemberships', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockBackfillResponse))
      }),
      graphql.query('FlagsSelect', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockFlagResponse))
      })
    )
  }

  describe('renders title coverage', () => {
    it('renders uncovered title coverage component', () => {
      render(<ToggleHeader />, { wrapper })

      const uncovered = screen.getByText('uncovered')
      expect(uncovered).toBeInTheDocument()
    })

    it('renders partial title coverage component', () => {
      render(<ToggleHeader />, { wrapper })

      const partial = screen.getByText('partial')
      expect(partial).toBeInTheDocument()
    })

    it('renders covered title coverage component', () => {
      render(<ToggleHeader />, { wrapper })

      const covered = screen.getByText('covered')
      expect(covered).toBeInTheDocument()
    })
  })

  describe('showFlagsSelect prop is passed', () => {
    describe('prop is true', () => {
      it('renders flag multi select', async () => {
        setup()
        render(<ToggleHeader showFlagsSelect={true} />, { wrapper })

        const flagMultiSelect = await screen.findByText(/All flags/)
        expect(flagMultiSelect).toBeInTheDocument()
      })
    })

    describe('prop is false', () => {
      it('does not render prop', () => {
        render(<ToggleHeader showFlagsSelect={false} />, { wrapper })

        const flagMultiSelect = screen.queryByText(/All flags/)
        expect(flagMultiSelect).not.toBeInTheDocument()
      })
    })
  })

  describe('when showHitCount prop is passed', () => {
    describe('prop is set to true', () => {
      it('renders legend', () => {
        render(<ToggleHeader title={'sample title'} showHitCount={true} />, {
          wrapper,
        })

        const hitIcon = screen.getByText('n')
        expect(hitIcon).toBeInTheDocument()

        const legendText = screen.getByText('upload #')
        expect(legendText).toBeInTheDocument()
      })
    })

    describe('prop is set to false', () => {
      it('does not render legend', () => {
        render(
          <ToggleHeader
            title={'sample title'}
            coverageIsLoading={false}
            showHitCount={false}
          />,
          { wrapper }
        )

        const hitIcon = screen.queryByText('n')
        expect(hitIcon).not.toBeInTheDocument()

        const legendText = screen.queryByText('upload #')
        expect(legendText).not.toBeInTheDocument()
      })
    })
  })
})
