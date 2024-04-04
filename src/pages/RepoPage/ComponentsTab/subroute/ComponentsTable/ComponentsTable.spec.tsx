import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  act,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { PropsWithChildren, Suspense } from 'react'
import { mockIsIntersecting } from 'react-intersection-observer/test-utils'
import { MemoryRouter, Route } from 'react-router-dom'

import ComponentsTable from './ComponentsTable'

const mockRepoConfig = {
  owner: {
    repository: {
      repositoryConfig: {
        indicationRange: { upperRange: 80, lowerRange: 60 },
      },
    },
  },
}

const mockGetRepo = {
  owner: {
    isCurrentUserPartOfOrg: true,
    orgUploadToken: 'token',
    isAdmin: true,
    isCurrentUserActivated: null,
    repository: {
      __typename: 'Repository',
      private: false,
      uploadToken: 'token',
      defaultBranch: 'main',
      yaml: '',
      activated: true,
      oldestCommitAt: '2020-01-01T12:00:00',
      active: true,
    },
  },
}

const mockComponentMeasurements = (after: boolean) => {
  return {
    owner: {
      repository: {
        __typename: 'Repository',
        flags: {
          edges: after
            ? [
                {
                  node: {
                    name: 'flagD',
                    percentCovered: 10,
                    percentChange: -1,
                    measurements: [{ avg: 20 }, { avg: 30 }],
                  },
                },
              ]
            : [
                {
                  node: {
                    name: 'flagA',
                    percentCovered: 93.26,
                    percentChange: -1.56,
                    measurements: [{ avg: 51.78 }, { avg: 93.356 }],
                  },
                },
                {
                  node: {
                    name: 'flagB',
                    percentCovered: 91.74,
                    percentChange: null,
                    measurements: [{ avg: null }, { avg: null }],
                  },
                },
                {
                  node: {
                    name: 'testtest',
                    percentCovered: 1.0,
                    percentChange: 1.0,
                    measurements: [{ avg: 51.78 }, { avg: 93.356 }],
                  },
                },
              ],
          pageInfo: {
            hasNextPage: after ? false : true,
            endCursor: after
              ? 'aa'
              : 'MjAyMC0wOC0xMSAxNzozMDowMiswMDowMHwxMDA=',
          },
        },
      },
    },
  }
}

const mockNoReportsUploadedMeasurements = {
  owner: {
    repository: {
      __typename: 'Repository',
      flags: {
        edges: [
          {
            node: {
              name: 'flagA',
              percentCovered: null,
              percentChange: null,
              measurements: [],
            },
          },
        ],
        pageInfo: {
          hasNextPage: true,
          endCursor: 'end-cursor',
        },
      },
    },
  },
}

const mockEmptyComponentMeasurements = {
  owner: {
    repository: {
      __typename: 'Repository',
      flags: {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          endCursor: null,
        },
      },
    },
  },
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      retry: false,
    },
  },
})
const server = setupServer()
let testLocation: any
const wrapper =
  (
    initialEntries = '/gh/codecov/gazebo/components'
  ): React.FC<PropsWithChildren> =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route path="/:provider/:owner/:repo/components">
            <Suspense fallback={null}>{children}</Suspense>
          </Route>
          <Route
            path="*"
            render={({ location }) => {
              testLocation = location
              return null
            }}
          />
        </MemoryRouter>
      </QueryClientProvider>
    )

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('ComponentsTable', () => {
  function setup({
    noData = false,
    noReportsUploaded = false,
  }: {
    noData?: boolean
    noReportsUploaded?: boolean
  }) {
    const user = userEvent.setup()
    const fetchNextPage = jest.fn()

    server.use(
      graphql.query('FlagMeasurements', (req, res, ctx) => {
        if (req?.variables?.after) {
          return res(ctx.status(200), ctx.data(mockComponentMeasurements(true)))
        }

        if (noData) {
          return res(ctx.status(200), ctx.data(mockEmptyComponentMeasurements))
        }

        if (noReportsUploaded) {
          return res(
            ctx.status(200),
            ctx.data(mockNoReportsUploadedMeasurements)
          )
        }

        return res(ctx.status(200), ctx.data(mockComponentMeasurements(false)))
      }),
      graphql.query('GetRepo', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockGetRepo))
      }),
      graphql.query('RepoConfig', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockRepoConfig))
      )
    )

    return { fetchNextPage, user }
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup({})
    })

    it('renders table headers', async () => {
      render(<ComponentsTable />, { wrapper: wrapper() })

      const components = await screen.findByText('Components')
      expect(components).toBeInTheDocument()

      const coverage = await screen.findByText('Coverage %')
      expect(coverage).toBeInTheDocument()

      const trend = await screen.findByText('Trend')
      expect(trend).toBeInTheDocument()
    })

    it('renders repo components', async () => {
      render(<ComponentsTable />, { wrapper: wrapper() })

      const flagA = await screen.findByRole('link', { name: 'flagA' })
      expect(flagA).toBeInTheDocument()
      expect(flagA).toHaveAttribute(
        'href',
        '/gh/codecov/gazebo?flags%5B0%5D=flagA'
      )

      const flagB = await screen.findByRole('link', { name: 'flagB' })
      expect(flagB).toBeInTheDocument()
      expect(flagB).toHaveAttribute(
        'href',
        '/gh/codecov/gazebo?flags%5B0%5D=flagB'
      )
    })

    it('renders components coverage', async () => {
      render(<ComponentsTable />, { wrapper: wrapper() })

      const ninetyThreePercent = await screen.findByText(/93.26%/)
      expect(ninetyThreePercent).toBeInTheDocument()

      const ninetyOnePercent = await screen.findByText(/91.74%/)
      expect(ninetyOnePercent).toBeInTheDocument()
    })

    it('renders components sparkline with change', async () => {
      render(<ComponentsTable />, { wrapper: wrapper() })

      const componentaSparkLine = await screen.findByText(
        /Component flagA trend sparkline/
      )
      expect(componentaSparkLine).toBeInTheDocument()

      const minusOne = await screen.findByText(/-1.56/)
      expect(minusOne).toBeInTheDocument()

      const component2SparkLine = await screen.findByText(
        /Component flagB trend sparkline/
      )
      expect(component2SparkLine).toBeInTheDocument()

      const noData = await screen.findByText('No Data')
      expect(noData).toBeInTheDocument()
    })
  })

  describe('component name is clicked', () => {
    it('goes to coverage page', async () => {
      const { user } = setup({})

      render(<ComponentsTable />, { wrapper: wrapper() })

      const flagA = await screen.findByRole('link', { name: 'flagA' })
      expect(flagA).toBeInTheDocument()
      expect(flagA).toHaveAttribute(
        'href',
        '/gh/codecov/gazebo?flags%5B0%5D=flagA'
      )

      user.click(flagA)
      expect(testLocation.pathname).toBe('/gh/codecov/gazebo/components')
    })
  })

  describe('when the delete icon is clicked', () => {
    it('calls functions to open modal', async () => {
      const { user } = setup({})
      render(<ComponentsTable />, { wrapper: wrapper() })

      const trashIconButtons = await screen.findAllByRole('button', {
        name: /trash/,
      })
      expect(trashIconButtons).toHaveLength(3)

      const [firstIcon] = trashIconButtons
      await act(async () => {
        if (firstIcon) {
          await user.click(firstIcon)
        }
      })

      const deleteComponentModalText = await screen.findByText(
        'Delete Component'
      )
      expect(deleteComponentModalText).toBeInTheDocument()

      const cancelButton = await screen.findByRole('button', {
        name: /Cancel/,
      })
      await user.click(cancelButton)
      await waitFor(() =>
        expect(deleteComponentModalText).not.toBeInTheDocument()
      )
    })
  })

  describe('when no data is returned', () => {
    describe('isSearching is false', () => {
      beforeEach(() => {
        setup({ noData: true })
      })

      it('renders expected empty state message', async () => {
        render(<ComponentsTable />, { wrapper: wrapper() })

        const errorMessage = await screen.findByText(
          /There was a problem getting components data/
        )
        expect(errorMessage).toBeInTheDocument()
      })
    })

    describe('isSearching is true', () => {
      beforeEach(() => {
        setup({ noData: true })
      })

      it('renders expected empty state message', async () => {
        render(<ComponentsTable />, {
          wrapper: wrapper('/gh/codecov/gazebo/components?search=blah'),
        })

        const noResultsFound = await screen.findByText(/No results found/)
        expect(noResultsFound).toBeInTheDocument()
      })
    })
  })

  describe('when hasNextPage is true', () => {
    it('infinite scroll for loading next page', async () => {
      setup({})
      render(<ComponentsTable />, { wrapper: wrapper() })

      const loading = await screen.findByText('Loading')
      mockIsIntersecting(loading, true)
      await waitForElementToBeRemoved(loading)

      const flagD = screen.getByRole('link', { name: 'flagD' })
      expect(flagD).toBeInTheDocument()
    })
  })

  describe('when sorting', () => {
    it('updates state to reflect column sorted on', async () => {
      const { user } = setup({})
      render(<ComponentsTable />, { wrapper: wrapper() })

      const components = await screen.findByText('Components')

      await user.click(components)

      const flagA = await screen.findByTestId('row-0')
      const flagARole = await screen.findByRole('link', { name: 'flagA' })
      const flagB = await screen.findByTestId('row-1')
      const flagBRole = await screen.findByRole('link', { name: 'flagB' })
      const testFlag = await screen.findByTestId('row-2')
      const testFlagRole = await screen.findByRole('link', { name: 'testtest' })

      expect(flagA).toContainElement(flagARole)
      expect(flagB).toContainElement(flagBRole)
      expect(testFlag).toContainElement(testFlagRole)
    })
  })

  describe('when no coverage report uploaded', () => {
    it('renders no report data state', async () => {
      setup({ noReportsUploaded: true })
      render(<ComponentsTable />, { wrapper: wrapper() })

      const dash = await screen.findByText('-')
      expect(dash).toBeInTheDocument()
    })
  })
})
