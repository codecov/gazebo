import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Location } from 'history'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import type { ReactNode } from 'react'
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
  private: false,
  defaultBranch: 'main',
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

const wrapper = ({ children }: { children: ReactNode }) => (
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
    const mockApiVars = jest.fn()

    server.use(
      graphql.query('GetBranchComponents', (req, res, ctx) => {
        mockApiVars(req.variables)

        return res(
          ctx.status(200),
          ctx.data(mockComponentsResponse(components))
        )
      }),
      graphql.query('GetRepoOverview', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({ owner: { repository: mockRepoOverview } })
        )
      ),
      graphql.query('GetBranch', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({
            owner: { repository: { __typename: 'Repository', ...mockBranch } },
          })
        )
      ),
      graphql.query('GetBranches', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(branchesMock))
      }),
      graphql.query('GetRepoCoverage', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({ owner: { repository: mockRepoCoverage } })
        )
      )
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

    it('calls the api with search term', async () => {
      const { user, mockApiVars } = setup()

      render(<ComponentsMultiSelect />, { wrapper })

      const select = await screen.findByText('All components')
      expect(select).toBeInTheDocument()
      await user.click(select)

      const searchBox = screen.getByPlaceholderText('Search for components')
      await user.type(searchBox, 'component-2')

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      await waitFor(() =>
        expect(mockApiVars).toHaveBeenLastCalledWith({
          owner: 'codecov',
          repo: 'cool-repo',
          branch: 'main',
          filters: { components: ['component-2'] },
        })
      )
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
