import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route, useLocation } from 'react-router-dom'

import ComponentsTable from './ComponentsTable'

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
      isFirstPullRequest: false,
    },
  },
}

const mockedComponentMeasurements = {
  owner: {
    repository: {
      __typename: 'Repository',
      coverageAnalytics: {
        components: [
          {
            componentId: 'components1_id',
            name: 'components1',
            percentCovered: 93.26,
            percentChange: -1.56,
            lastUploaded: '2021-09-30T00:00:00Z',
            measurements: [{ avg: 51.78 }, { avg: 93.356 }],
          },
          {
            componentId: 'components2_id',
            name: 'component2',
            percentCovered: 91.74,
            percentChange: null,
            lastUploaded: null,
            measurements: [{ avg: null }, { avg: null }],
          },

          {
            componentId: 'testtest_id',
            name: 'testtest',
            percentCovered: 1.0,
            percentChange: 1.0,
            lastUploaded: null,
            measurements: [{ avg: 51.78 }, { avg: 93.356 }],
          },
        ],
      },
    },
  },
}

const mockNoReportsUploadedMeasurements = {
  owner: {
    repository: {
      __typename: 'Repository',
      coverageAnalytics: {
        components: [
          {
            name: 'components1',
            componentId: 'components1_id',
            percentCovered: null,
            percentChange: null,
            lastUploaded: null,
            measurements: [],
          },
        ],
      },
    },
  },
}

const mockEmptyComponentMeasurements = {
  owner: {
    repository: {
      __typename: 'Repository',
      coverageAnalytics: {
        components: [],
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
    initialEntries = '/gh/codecov/gazebo/components'
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
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
    const fetchNextPage = vi.fn()

    server.use(
      graphql.query('ComponentMeasurements', (info) => {
        if (noData) {
          return HttpResponse.json({ data: mockEmptyComponentMeasurements })
        }

        if (noReportsUploaded) {
          return HttpResponse.json({
            data: mockNoReportsUploadedMeasurements,
          })
        }

        return HttpResponse.json({ data: mockedComponentMeasurements })
      }),
      graphql.query('GetRepo', (info) => {
        return HttpResponse.json({ data: mockGetRepo })
      }),
      graphql.query('RepoConfig', (info) => {
        return HttpResponse.json({ data: mockRepoConfig })
      })
    )

    return { fetchNextPage, user }
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup({})
      vi.useFakeTimers().setSystemTime(new Date('2024-02-02'))
    })

    afterAll(() => {
      vi.useRealTimers()
    })

    it('renders table headers', async () => {
      render(<ComponentsTable />, { wrapper: wrapper() })

      const components = await screen.findByText('Components')
      expect(components).toBeInTheDocument()

      const coverage = await screen.findByText('Coverage %')
      expect(coverage).toBeInTheDocument()

      const trend = await screen.findByText('Historical Trend')
      expect(trend).toBeInTheDocument()

      const lastUploaded = await screen.findByText('Last Uploaded')
      expect(lastUploaded).toBeInTheDocument()
    })

    it('renders repo components', async () => {
      render(<ComponentsTable />, { wrapper: wrapper() })

      const components1 = await screen.findByRole('link', {
        name: 'components1',
      })
      expect(components1).toBeInTheDocument()
      expect(components1).toHaveAttribute(
        'href',
        '/gh/codecov/gazebo?components%5B0%5D=components1'
      )

      const component2 = await screen.findByRole('link', { name: 'component2' })
      expect(component2).toBeInTheDocument()
      expect(component2).toHaveAttribute(
        'href',
        '/gh/codecov/gazebo?components%5B0%5D=component2'
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
        /Component components1 trend sparkline/
      )
      expect(componentaSparkLine).toBeInTheDocument()

      const minusOne = await screen.findByText(/-1.56/)
      expect(minusOne).toBeInTheDocument()

      const component2SparkLine = await screen.findByText(
        /Component component2 trend sparkline/
      )
      expect(component2SparkLine).toBeInTheDocument()

      const noData = await screen.findByText('No Data')
      expect(noData).toBeInTheDocument()
    })

    it('renders last uploaded date', async () => {
      render(<ComponentsTable />, { wrapper: wrapper() })

      const lastUploaded = await screen.findByText('over 2 years ago')
      expect(lastUploaded).toBeInTheDocument()
    })
  })

  describe('component name is clicked', () => {
    it('goes to coverage page', async () => {
      const { user } = setup({})

      render(<ComponentsTable />, { wrapper: wrapper() })

      const components1 = await screen.findByRole('link', {
        name: 'components1',
      })
      expect(components1).toBeInTheDocument()
      expect(components1).toHaveAttribute(
        'href',
        '/gh/codecov/gazebo?components%5B0%5D=components1'
      )

      user.click(components1)
      expect(testLocation.pathname).toBe('/gh/codecov/gazebo/components')
    })
  })

  describe('when the delete icon is clicked', () => {
    it('calls functions to open modal', async () => {
      const { user } = setup({})
      render(<ComponentsTable />, { wrapper: wrapper() })

      const trashIconButtons = await screen.findAllByTestId('delete-component')
      expect(trashIconButtons).toHaveLength(3)

      const [firstIcon] = trashIconButtons
      await act(async () => {
        if (firstIcon) {
          await user.click(firstIcon)
        }
      })

      const deleteComponentModalText = await screen.findByTestId(
        'delete-component-modal'
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

      it('renders expected no data message', async () => {
        render(<ComponentsTable />, { wrapper: wrapper() })

        const noData = await screen.findByText(/No data to display/)
        expect(noData).toBeInTheDocument()
      })
    })

    describe('isSearching is true', () => {
      beforeEach(() => {
        setup({ noData: true })
      })

      it('renders expected empty state message', async () => {
        render(<ComponentsTable />, {
          wrapper: wrapper('/gh/codecov/gazebo/components?components=blah'),
        })

        const noResultsFound = await screen.findByText(/No results found/)
        expect(noResultsFound).toBeInTheDocument()
      })
    })
  })

  describe('when sorting', () => {
    it('updates state to reflect column sorted on', async () => {
      const { user } = setup({})
      render(<ComponentsTable />, { wrapper: wrapper() })

      const components = await screen.findByText('Components')

      await user.click(components)

      const components1 = await screen.findByTestId('row-0')
      const components1Role = await screen.findByRole('link', {
        name: 'components1',
      })
      const component2 = await screen.findByTestId('row-1')
      const component2Role = await screen.findByRole('link', {
        name: 'component2',
      })
      const testFlag = await screen.findByTestId('row-2')
      const testFlagRole = await screen.findByRole('link', { name: 'testtest' })

      expect(components1).toContainElement(components1Role)
      expect(component2).toContainElement(component2Role)
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
