import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Location } from 'history'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import ComponentsSelector from './ComponentsSelector'

const mockCommitComponentsResponse = (components: Array<{ name: string }>) => ({
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        coverageAnalytics: {
          components,
        },
      },
    },
  },
})

const queryClient = new QueryClient()
const server = setupServer()

let testLocation: Location

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
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
    const mockApiVars = vi.fn()

    server.use(
      graphql.query('CommitComponents', (info) => {
        mockApiVars(info.variables)
        return HttpResponse.json({
          data: mockCommitComponentsResponse(components),
        })
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

    it('shows components matching the search regex', async () => {
      const { user } = setup()

      render(<ComponentsSelector />, { wrapper })

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

      render(<ComponentsSelector />, { wrapper })

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

      const { container } = render(<ComponentsSelector />, { wrapper })

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      await waitFor(() => expect(container).toBeEmptyDOMElement())
    })
  })
})
