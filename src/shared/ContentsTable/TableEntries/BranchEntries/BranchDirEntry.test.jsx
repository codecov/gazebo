import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import BranchDirEntry from './BranchDirEntry'

const mockData = {
  owner: {
    username: 'codecov',
    repository: {
      __typename: 'Repository',
      repositoryConfig: {
        indicationRange: {
          upperRange: 80,
          lowerRange: 60,
        },
      },
      branch: {
        head: {
          deprecatedPathContents: {
            __typename: 'PathContentConnection',
            edges: [
              {
                node: {
                  __typename: 'PathContentDir',
                  name: 'src',
                  path: null,
                  percentCovered: 0.0,
                  hits: 4,
                  misses: 2,
                  lines: 7,
                  partials: 1,
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
    },
  },
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper =
  (initialEntries = ['/gh/codecov/test-repo/tree/main/src/']) =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/:provider/:owner/:repo/tree/:branch/:path+">
          {children}
        </Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('BranchDirEntry', () => {
  function setup() {
    const user = userEvent.setup()

    server.use(
      graphql.query('BranchContents', (info) => {
        return HttpResponse.json({ data: mockData })
      })
    )

    return { user }
  }

  it('displays the directory name', async () => {
    setup()
    render(
      <BranchDirEntry branch="branch" name="dir" urlPath="path/to/directory" />,
      { wrapper: wrapper() }
    )

    const dir = await screen.findByText('dir')
    expect(dir).toBeInTheDocument()
  })

  it('sets the correct href', async () => {
    setup()
    render(
      <BranchDirEntry branch="branch" name="dir" urlPath="path/to/directory" />,
      { wrapper: wrapper() }
    )

    const a = await screen.findByRole('link')
    expect(a).toHaveAttribute(
      'href',
      '/gh/codecov/test-repo/tree/branch/path%2Fto%2Fdirectory%2Fdir'
    )
  })

  describe('flags filter is set', () => {
    it('sets the correct href', async () => {
      setup()
      render(
        <BranchDirEntry
          branch="branch"
          name="dir"
          urlPath="path/to/directory"
          filters={{
            flags: ['flag-1'],
            components: [],
          }}
        />,
        {
          wrapper: wrapper([
            '/gh/codecov/test-repo/tree/main/src?flags=flag-1',
          ]),
        }
      )
      const a = await screen.findByRole('link')
      expect(a).toHaveAttribute(
        'href',
        '/gh/codecov/test-repo/tree/branch/path%2Fto%2Fdirectory%2Fdir?flags=flag-1'
      )
    })
  })

  describe('components and flags filters is set', () => {
    it('sets the correct href', async () => {
      setup()
      render(
        <BranchDirEntry
          branch="branch"
          name="dir"
          urlPath="path/to/directory"
          filters={{
            flags: ['flag-1'],
            components: ['component-1'],
          }}
        />,
        {
          wrapper: wrapper([
            '/gh/codecov/test-repo/tree/main/src?flags=flag-1&components=component-1',
          ]),
        }
      )

      const a = await screen.findByRole('link')
      expect(a).toHaveAttribute(
        'href',
        '/gh/codecov/test-repo/tree/branch/path%2Fto%2Fdirectory%2Fdir?flags=flag-1&components=component-1'
      )
    })
  })

  it('fires the prefetch function on hover', async () => {
    const { user } = setup()

    render(
      <BranchDirEntry branch="branch" name="dir" urlPath="path/to/directory" />,
      { wrapper: wrapper() }
    )

    await user.hover(screen.getByText('dir'))

    await waitFor(() => queryClient.getQueryState().isFetching)
    await waitFor(() => !queryClient.getQueryState().isFetching)
    await waitFor(() =>
      expect(queryClient.getQueryState().data).toStrictEqual({
        __typename: undefined,
        indicationRange: {
          lowerRange: 60,
          upperRange: 80,
        },
        pathContentsType: 'PathContentConnection',
        results: [
          {
            __typename: 'PathContentDir',
            hits: 4,
            lines: 7,
            misses: 2,
            name: 'src',
            partials: 1,
            path: null,
            percentCovered: 0,
          },
        ],
      })
    )
  })
})
