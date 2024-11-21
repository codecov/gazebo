import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  act,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { mockIsIntersecting } from 'react-intersection-observer/test-utils'
import { MemoryRouter, Route, useLocation } from 'react-router-dom'

import FlagsTable, { FlagTable } from './FlagsTable'

const mockRepoConfig = {
  owner: {
    repository: {
      __typename: 'Repository',
      repositoryConfig: {
        indicationRange: { upperRange: 80, lowerRange: 60 },
      },
    },
  },
}

const mockGetRepo = ({ isAdmin = true }) => ({
  owner: {
    isCurrentUserPartOfOrg: true,
    orgUploadToken: 'token',
    isAdmin: isAdmin,
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
      isFirstPullRequest: false,
    },
  },
})

const mockFlagMeasurements = ({
  after = false,
  nullFlag: includeNullFlag = false,
}) => {
  return {
    owner: {
      repository: {
        __typename: 'Repository',
        coverageAnalytics: {
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
                    node: includeNullFlag
                      ? null
                      : {
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
    },
  }
}

const mockNoReportsUploadedMeasurements = {
  owner: {
    repository: {
      __typename: 'Repository',
      coverageAnalytics: {
        flags: {
          edges: [
            {
              node: {
                name: 'flagA',
                percentCovered: null,
                percentChange: null,
                measurements: [{ avg: null }, { avg: null }],
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
  },
}

const mockEmptyFlagMeasurements = {
  owner: {
    repository: {
      __typename: 'Repository',
      coverageAnalytics: {
        flags: {
          edges: [],
          pageInfo: {
            hasNextPage: false,
            endCursor: null,
          },
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
let testLocation: ReturnType<typeof useLocation>
const wrapper =
  (
    initialEntries = '/gh/codecov/gazebo/flags'
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/:provider/:owner/:repo/flags">
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

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

interface SetupArgs {
  noData?: boolean
  includeNullFlag?: boolean
  noReportsUploaded?: boolean
  isAdmin?: boolean
}

describe('FlagsTable', () => {
  function setup({
    noData = false,
    includeNullFlag = false,
    noReportsUploaded = false,
    isAdmin = true,
  }: SetupArgs) {
    const user = userEvent.setup()
    const fetchNextPage = vi.fn()

    server.use(
      graphql.query('FlagMeasurements', (info) => {
        if (info?.variables?.after) {
          return HttpResponse.json({
            data: mockFlagMeasurements({ after: true }),
          })
        }

        if (noData) {
          return HttpResponse.json({ data: mockEmptyFlagMeasurements })
        }

        if (includeNullFlag) {
          return HttpResponse.json({
            data: mockFlagMeasurements({ nullFlag: true }),
          })
        }

        if (noReportsUploaded) {
          return HttpResponse.json({ data: mockNoReportsUploadedMeasurements })
        }

        return HttpResponse.json({ data: mockFlagMeasurements({}) })
      }),
      graphql.query('GetRepo', () => {
        return HttpResponse.json({ data: mockGetRepo({ isAdmin }) })
      }),
      graphql.query('RepoConfig', () =>
        HttpResponse.json({ data: mockRepoConfig })
      )
    )

    return { fetchNextPage, user }
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup({ includeNullFlag: true })
    })

    it('renders table headers', async () => {
      render(<FlagsTable />, { wrapper: wrapper() })

      const flags = await screen.findByText('Flags')
      expect(flags).toBeInTheDocument()

      const coverage = await screen.findByText('Coverage %')
      expect(coverage).toBeInTheDocument()

      const trend = await screen.findByText('Trend')
      expect(trend).toBeInTheDocument()

      await waitFor(() => screen.findByRole('link', { name: 'flagA' }))
    })

    it('renders repo flags', async () => {
      render(<FlagsTable />, { wrapper: wrapper() })

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

    it('does not render null flags', async () => {
      render(<FlagsTable />, { wrapper: wrapper() })

      await waitFor(() => screen.findByRole('link', { name: 'flagA' }))

      const nullFlag = screen.queryByRole('link', { name: 'testtest' })
      expect(nullFlag).not.toBeInTheDocument()
    })

    it('renders flags coverage', async () => {
      render(<FlagsTable />, { wrapper: wrapper() })

      const ninetyThreePercent = await screen.findByText(/93.26%/)
      expect(ninetyThreePercent).toBeInTheDocument()

      const ninetyOnePercent = await screen.findByText(/91.74%/)
      expect(ninetyOnePercent).toBeInTheDocument()
    })

    it('renders flags sparkline with change', async () => {
      render(<FlagsTable />, { wrapper: wrapper() })

      const flagaSparkLine = await screen.findByText(
        /Flag flagA trend sparkline/
      )
      expect(flagaSparkLine).toBeInTheDocument()

      const minusOne = await screen.findByText(/-1.56/)
      expect(minusOne).toBeInTheDocument()

      const flag2SparkLine = await screen.findByText(
        /Flag flagB trend sparkline/
      )
      expect(flag2SparkLine).toBeInTheDocument()

      const noData = await screen.findByText('No Data')
      expect(noData).toBeInTheDocument()
    })
  })

  describe('flag name is clicked', () => {
    it('goes to coverage page', async () => {
      const { user } = setup({})

      render(<FlagsTable />, { wrapper: wrapper() })

      const flagA = await screen.findByRole('link', { name: 'flagA' })
      expect(flagA).toBeInTheDocument()
      expect(flagA).toHaveAttribute(
        'href',
        '/gh/codecov/gazebo?flags%5B0%5D=flagA'
      )

      user.click(flagA)
      expect(testLocation.pathname).toBe('/gh/codecov/gazebo/flags')
    })
  })

  describe('when user is not an admin', () => {
    it('does not render delete button', async () => {
      setup({ isAdmin: false })
      render(<FlagsTable />, { wrapper: wrapper() })

      await waitFor(() => screen.findByRole('link', { name: 'flagA' }))

      const trashIconButtons = screen.queryAllByRole('button', {
        name: /trash/,
      })
      expect(trashIconButtons).toHaveLength(0)
    })
  })

  describe('when the delete icon is clicked', () => {
    it('calls functions to open modal', async () => {
      const { user } = setup({})
      render(<FlagsTable />, { wrapper: wrapper() })

      const trashIconButtons = await screen.findAllByTestId(/trash/)
      expect(trashIconButtons).toHaveLength(3)

      const [firstIcon] = trashIconButtons
      await act(async () => {
        if (firstIcon) {
          await user.click(firstIcon)
        }
      })

      const deleteFlagModalText = await screen.findByText('Delete Flag')
      expect(deleteFlagModalText).toBeInTheDocument()

      const cancelButton = await screen.findByRole('button', {
        name: /Cancel/,
      })
      await user.click(cancelButton)
      await waitFor(() => expect(deleteFlagModalText).not.toBeInTheDocument())
    })
  })

  describe('when no data is returned', () => {
    describe('isSearching is false', () => {
      beforeEach(() => {
        setup({ noData: true })
      })

      it('renders expected empty state message', async () => {
        render(<FlagsTable />, { wrapper: wrapper() })

        const errorMessage = await screen.findByText(
          /There was a problem getting flags data/
        )
        expect(errorMessage).toBeInTheDocument()
      })
    })

    describe('isSearching is true', () => {
      beforeEach(() => {
        setup({ noData: true })
      })

      it('renders expected empty state message', async () => {
        render(<FlagsTable />, {
          wrapper: wrapper('/gh/codecov/gazebo/flags?search=blah'),
        })

        const noResultsFound = await screen.findByText(/No results found/)
        expect(noResultsFound).toBeInTheDocument()
      })
    })
  })

  describe('when hasNextPage is true', () => {
    it('infinite scroll for loading next page', async () => {
      setup({})
      render(<FlagsTable />, { wrapper: wrapper() })

      const loading = await screen.findByText('Loading')
      mockIsIntersecting(loading, true)
      await waitForElementToBeRemoved(loading)

      const flagD = await screen.findByRole('link', { name: 'flagD' })
      expect(flagD).toBeInTheDocument()
    })
  })

  describe('when sorting', () => {
    it('updates state to reflect column sorted on', async () => {
      const { user } = setup({})
      render(<FlagsTable />, { wrapper: wrapper() })

      const flags = await screen.findByText('Flags')

      await user.click(flags)

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
      render(<FlagsTable />, { wrapper: wrapper() })
      const dash = await screen.findByText('-')
      expect(dash).toBeInTheDocument()
    })
  })

  describe('when loading data', () => {
    it('renders loader', async () => {
      setup({})
      render(
        <FlagTable
          tableData={[]}
          isLoading={true}
          sorting={[]}
          setSorting={() => {}}
        />,
        { wrapper: wrapper() }
      )

      const loader = await screen.findByTestId('spinner')
      expect(loader).toBeInTheDocument()
    })
  })
})
