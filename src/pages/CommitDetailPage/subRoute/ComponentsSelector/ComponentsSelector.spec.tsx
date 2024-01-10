import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Location } from 'history'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import type { ReactNode } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import ComponentsSelector from './ComponentsSelector'

const mockCommitComponentsResponse = (components: Array<{ name: string }>) => ({
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        components,
      },
    },
  },
})

const queryClient = new QueryClient()
const server = setupServer()

let testLocation: Location

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/cool-repo/commit/123']}>
      <Route path="/:provider/:owner/:repo/commit/:commit">{children}</Route>
      <Route
        path="/:provider/:owner/:repo/commit/:commit"
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

describe('ComponentsSelector', () => {
  function setup(
    { components } = {
      components: [
        { name: 'component-1' },
        { name: 'component-2' },
        { name: 'component-3' },
      ],
    }
  ) {
    const user = userEvent.setup()
    const mockApiVars = jest.fn()

    server.use(
      graphql.query('CommitComponents', (req, res, ctx) => {
        mockApiVars(req.variables)
        return res(
          ctx.status(200),
          ctx.data(mockCommitComponentsResponse(components))
        )
      })
    )

    return { user, mockApiVars }
  }

  describe('when selecting a component', () => {
    it('updates the location params', async () => {
      const { user } = setup()

      render(<ComponentsSelector />, { wrapper })

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

      render(<ComponentsSelector />, { wrapper })

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

      render(<ComponentsSelector />, { wrapper })

      const select = await screen.findByText('All components')
      expect(select).toBeInTheDocument()
      await user.click(select)

      const searchBox = screen.getByPlaceholderText('Search for components')
      await user.type(searchBox, 'component-2')

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      await waitFor(() =>
        expect(mockApiVars).toHaveBeenCalledWith({
          owner: 'codecov',
          commitId: '123',
          repo: 'cool-repo',
          provider: 'gh',
          filters: { components: ['component-2'] },
        })
      )
    })
  })

  describe('when components count is zero', () => {
    it('does not show multi select', async () => {
      setup({ components: [] })

      const { container } = render(<ComponentsSelector />, { wrapper })

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      await waitFor(() => expect(container).toBeEmptyDOMElement())
    })
  })
})
