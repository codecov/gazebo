import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import PullDirEntry from './PullDirEntry'

const mockData = {
  owner: {
    repository: {
      __typename: 'Repository',
      repositoryConfig: {
        indicationRange: {
          upperRange: 80,
          lowerRange: 60,
        },
      },
      pull: {
        head: {
          commitid: 'commit123',
          pathContents: {
            __typename: 'PathContents',
            results: [
              {
                __typename: 'PathContentDir',
                name: 'src',
                path: null,
                hits: 4,
                misses: 2,
                partials: 1,
                lines: 10,
                percentCovered: 40.0,
              },
            ],
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

const wrapper: ({
  initialEntries,
}?: {
  initialEntries: string[]
}) => React.FC<React.PropsWithChildren> =
  (
    { initialEntries } = {
      initialEntries: ['/gh/codecov/test-repo/pull/123/tree'],
    }
  ) =>
  ({ children }) => (
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
      graphql.query('PullPathContents', () => {
        return HttpResponse.json({ data: mockData })
      })
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

    const queryKey = queryClient
      .getQueriesData({})
      ?.at(0)
      ?.at(0) as Array<string>

    await waitFor(() =>
      expect(queryClient.getQueryState(queryKey)?.data).toStrictEqual({
        __typename: 'PathContents',
        results: [
          {
            __typename: 'PathContentDir',
            name: 'src',
            path: null,
            percentCovered: 40.0,
            hits: 4,
            misses: 2,
            lines: 10,
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
          ordering: { direction: 'ASC', parameter: 'NAME' },
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
