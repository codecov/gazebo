import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import PullDirEntry from './PullDirEntry'

const mockData = {
  username: 'codecov',
  repository: {
    pull: {
      head: {
        commitid: '123',
        pathContents: {
          __typename: 'PathContents',
          results: [
            {
              __typename: 'PathContentDir',
              name: 'src',
              path: null,
              percentCovered: 0.0,
              hits: 4,
              misses: 2,
              lines: 7,
              partials: 1,
            },
          ],
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
  (
    { initialEntries } = {
      initialEntries: ['/gh/codecov/test-repo/pull/123/tree'],
    }
  ) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path="/:provider/:owner/:repo/pull/:pullId/:path+">
            {children}
          </Route>
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

describe('PullDirEntry', () => {
  function setup() {
    server.use(
      graphql.query('PullPathContents', (req, res, ctx) =>
        res(ctx.status(200), ctx.data({ owner: mockData }))
      )
    )
  }

  beforeEach(() => {
    setup()
  })

  it('displays the directory name', () => {
    render(
      <PullDirEntry pullId="123" name="dir" urlPath="path/to/directory" />,
      { wrapper: wrapper() }
    )

    expect(screen.getByText('dir')).toBeInTheDocument()
  })

  describe('path is provided', () => {
    it('sets the correct href', () => {
      render(
        <PullDirEntry pullId="123" name="dir" urlPath="path/to/directory" />,
        { wrapper: wrapper() }
      )

      const a = screen.getByRole('link')
      expect(a).toHaveAttribute(
        'href',
        '/gh/codecov/test-repo/pull/123/tree/path/to/directory/dir'
      )
    })
  })

  describe('no path is provided', () => {
    it('sets the correct href', () => {
      render(<PullDirEntry pullId="123" name="dir" />, { wrapper: wrapper() })

      const a = screen.getByRole('link')
      expect(a).toHaveAttribute(
        'href',
        '/gh/codecov/test-repo/pull/123/tree/dir'
      )
    })
  })

  it('fires the prefetch function on hover', async () => {
    const user = userEvent.setup()
    render(
      <PullDirEntry pullId="123" name="dir" urlPath="path/to/directory" />,
      { wrapper: wrapper() }
    )

    const dir = screen.getByText('dir')
    await user.hover(dir)

    await waitFor(() =>
      expect(queryClient.getQueryState().data).toStrictEqual({
        __typename: 'PathContents',
        results: [
          {
            __typename: 'PathContentDir',
            name: 'src',
            path: null,
            percentCovered: 0,
            hits: 4,
            misses: 2,
            lines: 7,
            partials: 1,
          },
        ],
      })
    )
  })

  it('passes flags from the search params', () => {
    render(
      <PullDirEntry
        pullId="123"
        name="dir"
        urlPath="path/to/directory"
        filters={{
          ordering: { direction: 'asc', parameter: 'name' },
          flags: ['a', 'b'],
        }}
      />,
      {
        wrapper: wrapper({
          initialEntries: ['/gh/codecov/test-repo/pull/123/tree'],
        }),
      }
    )

    const a = screen.getByRole('link')
    expect(a).toHaveAttribute(
      'href',
      '/gh/codecov/test-repo/pull/123/tree/path/to/directory/dir?flags%5B0%5D=a&flags%5B1%5D=b'
    )
  })
})
