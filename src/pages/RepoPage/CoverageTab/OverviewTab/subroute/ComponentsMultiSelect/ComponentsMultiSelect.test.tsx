import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Location } from 'history'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'

import ComponentsMultiSelect from './ComponentsMultiSelect'

const mockComponentsResponse = (components: Array<{ name: string }>) => ({
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        name: 'main',
        head: {
          commitid: 'commit-123',
          components,
        },
      },
    },
  },
})

const mockRepoOverview = {
  __typename: 'Repository',
  private: false,
  defaultBranch: 'main',
  oldestCommitAt: '2022-10-10T11:59:59',
  coverageEnabled: true,
  bundleAnalysisEnabled: true,
  languages: [],
  testAnalyticsEnabled: true,
}

const mockBranch = {
  branch: {
    name: 'main',
    head: {
      commitid: '321fdsa',
    },
  },
}

const branchesMock = {
  owner: {
    repository: {
      __typename: 'Repository',
      branches: {
        edges: [
          {
            node: {
              name: 'main',
              head: {
                commitid: '1',
              },
            },
          },
          {
            node: {
              name: 'dummy',
              head: {
                commitid: '2',
              },
            },
          },
          {
            node: {
              name: 'dummy2',
              head: {
                commitid: '3',
              },
            },
          },
        ],
        pageInfo: {
          hasNextPage: false,
          endCursor: 'someEndCursor',
        },
      },
    },
  },
}

const mockRepoCoverage = {
  branch: {
    name: 'main',
    head: {
      yamlState: 'DEFAULT',
      totals: {
        percentCovered: 95.0,
        lineCount: 100,
        hitsCount: 100,
      },
    },
  },
}

const queryClient = new QueryClient()
const server = setupServer()

let testLocation: Location

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/cool-repo/pull/9']}>
      <Route path="/:provider/:owner/:repo/pull/:pullId">{children}</Route>
      <Route
        path="/:provider/:owner/:repo/pull/:pullId"
        render={({ location }) => {
          testLocation = location
          return null
        }}
      />
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  server.restoreHandlers()
})

afterAll(() => {
  server.close()
})

describe('ComponentsMultiSelect', () => {
  function setup(
    { components } = {
      components: [
        { name: 'component-1', id: 'c1' },
        { name: 'component-2', id: 'c2' },
        { name: 'component-3', id: 'c3' },
      ],
    }
  ) {
    const user = userEvent.setup()
    const mockApiVars = vi.fn()

    server.use(
      graphql.query('GetBranchComponents', (info) => {
        mockApiVars(info.variables)

        return HttpResponse.json({ data: mockComponentsResponse(components) })
      }),
      graphql.query('GetRepoOverview', (info) => {
        return HttpResponse.json({
          data: {
            owner: {
              isCurrentUserActivated: true,
              repository: mockRepoOverview,
            },
          },
        })
      }),
      graphql.query('GetBranch', (info) => {
        return HttpResponse.json({
          data: {
            owner: { repository: { __typename: 'Repository', ...mockBranch } },
          },
        })
      }),
      graphql.query('GetBranches', (info) => {
        return HttpResponse.json({ data: branchesMock })
      }),
      graphql.query('GetRepoCoverage', (info) => {
        return HttpResponse.json({
          data: { owner: { repository: mockRepoCoverage } },
        })
      })
    )

    return { user, mockApiVars }
  }

  describe('when selecting a component', () => {
    it('updates the location params', async () => {
      const { user } = setup()

      render(<ComponentsMultiSelect />, { wrapper })

      const select = await screen.findByText('All components')
      expect(select).toBeInTheDocument()
      await user.click(select)

      const component1 = await screen.findByText('component-1')
      expect(component1).toBeInTheDocument()
      await user.click(component1)

      expect(testLocation?.state).toStrictEqual({
        search: '',
        components: ['component-1'],
      })
    })
  })

  describe('when searching for a component', () => {
    it('updates the text box', async () => {
      const { user } = setup()

      render(<ComponentsMultiSelect />, { wrapper })

      const select = await screen.findByText('All components')
      expect(select).toBeInTheDocument()
      await user.click(select)

      const searchBox = screen.getByPlaceholderText('Search for components')
      await user.type(searchBox, 'component-2')

      const searchBoxUpdated = screen.getByPlaceholderText(
        'Search for components'
      )
      expect(searchBoxUpdated).toHaveAttribute('value', 'component-2')
    })

    it('shows components matching the search regex', async () => {
      const { user } = setup()

      render(<ComponentsMultiSelect />, { wrapper })

      const select = await screen.findByText('All components')
      expect(select).toBeInTheDocument()
      await user.click(select)

      let component1: HTMLElement | null =
        await screen.findByText('component-1')
      expect(component1).toBeInTheDocument()
      let component2 = await screen.findByText('component-2')
      expect(component2).toBeInTheDocument()
      let component3: HTMLElement | null =
        await screen.findByText('component-3')
      expect(component3).toBeInTheDocument()

      const searchBox = screen.getByPlaceholderText('Search for components')
      await user.type(searchBox, 'c.*-2')

      await waitForElementToBeRemoved(component1)

      component1 = screen.queryByText('component-1')
      expect(component1).not.toBeInTheDocument()
      component2 = await screen.findByText('component-2')
      expect(component2).toBeInTheDocument()
      component3 = screen.queryByText('component-3')
      expect(component3).not.toBeInTheDocument()
    })

    it('falls back to substring search when bad regex is provided', async () => {
      const { user } = setup()

      render(<ComponentsMultiSelect />, { wrapper })

      const select = await screen.findByText('All components')
      expect(select).toBeInTheDocument()
      await user.click(select)

      const component1 = await screen.findByText('component-1')
      expect(component1).toBeInTheDocument()
      const component2 = await screen.findByText('component-2')
      expect(component2).toBeInTheDocument()
      const component3 = await screen.findByText('component-3')
      expect(component3).toBeInTheDocument()

      const searchBox = screen.getByPlaceholderText('Search for components')
      await user.type(searchBox, '(')

      await waitForElementToBeRemoved(component1)

      const noResults = await screen.findByText('No results found')
      expect(noResults).toBeInTheDocument()
    })
  })

  describe('when components count is zero', () => {
    it('does not show multi select', async () => {
      setup({ components: [] })

      const { container } = render(<ComponentsMultiSelect />, { wrapper })

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      await waitFor(() => expect(container).toBeEmptyDOMElement())
    })
  })
})
