import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import qs from 'qs'
import { MemoryRouter, Route } from 'react-router-dom'

import CommitDirEntry from './CommitDirEntry'

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
      commit: {
        pathContents: {
          __typename: 'PathContents',
          results: [
            {
              name: 'src',
              path: null,
              __typename: 'PathContentDir',
              hits: 4,
              misses: 2,
              percentCovered: 50.0,
              partials: 1,
              lines: 7,
              type: 'file',
              isCriticalFile: false,
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

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/test-repo/commit/1234/tree']}>
      <Route path="/:provider/:owner/:repo/commit/:commit/:path+">
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

describe('CommitDirEntry', () => {
  function setup() {
    server.use(
      graphql.query('CommitPathContents', () => {
        return HttpResponse.json({ data: mockData })
      })
    )
  }

  beforeEach(() => {
    setup()
  })

  it('displays the directory name', () => {
    render(
      <CommitDirEntry
        commitSha="1234"
        name="dir"
        urlPath="path/to/directory"
      />,
      { wrapper }
    )

    expect(screen.getByText('dir')).toBeInTheDocument()
  })

  describe('path is provided', () => {
    it('sets the correct href', () => {
      render(
        <CommitDirEntry
          commitSha="1234"
          name="dir"
          urlPath="path/to/directory"
        />,
        { wrapper }
      )

      const a = screen.getByRole('link')
      expect(a).toHaveAttribute(
        'href',
        '/gh/codecov/test-repo/commit/1234/tree/path/to/directory/dir'
      )
    })

    describe('filters are passed', () => {
      it('sets the correct href', () => {
        render(
          <CommitDirEntry
            commitSha="1234"
            name="dir"
            urlPath="path/to/directory"
            filters={{ flags: ['flag-1'], components: ['component-1'] }}
          />,
          { wrapper }
        )

        const a = screen.getByRole('link')
        expect(a).toHaveAttribute(
          'href',
          `/gh/codecov/test-repo/commit/1234/tree/path/to/directory/dir${qs.stringify(
            { flags: ['flag-1'], components: ['component-1'] },
            { addQueryPrefix: true }
          )}`
        )
      })
    })
  })

  describe('no path is provided', () => {
    it('sets the correct href', () => {
      render(<CommitDirEntry commitSha="1234" name="dir" />, { wrapper })

      const a = screen.getByRole('link')
      expect(a).toHaveAttribute(
        'href',
        '/gh/codecov/test-repo/commit/1234/tree/dir'
      )
    })

    describe('filters are passed', () => {
      it('sets the correct href', () => {
        render(
          <CommitDirEntry
            commitSha="1234"
            name="dir"
            filters={{ flags: ['flag-1'] }}
          />,
          { wrapper }
        )

        const a = screen.getByRole('link')
        expect(a).toHaveAttribute(
          'href',
          `/gh/codecov/test-repo/commit/1234/tree/dir${qs.stringify(
            { flags: ['flag-1'] },
            { addQueryPrefix: true }
          )}`
        )
      })
    })
  })

  it('fires the prefetch function on hover', async () => {
    const user = userEvent.setup()
    render(
      <CommitDirEntry
        commitSha="1234"
        name="dir"
        urlPath="path/to/directory"
      />,
      { wrapper }
    )

    const dir = screen.getByText('dir')
    await user.hover(dir)

    const queryKey = queryClient
      .getQueriesData({})
      ?.at(0)
      ?.at(0) as Array<string>

    await waitFor(() =>
      expect(queryClient.getQueryState(queryKey)?.data).toStrictEqual({
        indicationRange: {
          upperRange: 80,
          lowerRange: 60,
        },
        results: [
          {
            __typename: 'PathContentDir',
            name: 'src',
            path: null,
            percentCovered: 50.0,
            hits: 4,
            misses: 2,
            lines: 7,
            partials: 1,
          },
        ],
      })
    )
  })
})
