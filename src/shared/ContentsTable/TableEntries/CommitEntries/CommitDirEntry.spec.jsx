import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import CommitDirEntry from './CommitDirEntry'

const mockData = {
  owner: {
    username: 'codecov',
    repository: {
      commit: {
        pathContents: {
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

const queryClient = new QueryClient()
const server = setupServer()

const wrapper = ({ children }) => (
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
      graphql.query('CommitPathContents', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockData))
      )
    )
  }

  beforeEach(() => {
    setup()
  })

  it('displays the directory name', () => {
    render(
      <CommitDirEntry commitSha="1234" name="dir" path="path/to/directory" />,
      { wrapper }
    )

    expect(screen.getByText('dir')).toBeInTheDocument()
  })

  describe('path is provided', () => {
    it('sets the correct href', () => {
      render(
        <CommitDirEntry commitSha="1234" name="dir" path="path/to/directory" />,
        { wrapper }
      )

      const a = screen.getByRole('link')
      expect(a).toHaveAttribute(
        'href',
        '/gh/codecov/test-repo/commit/1234/tree/path/to/directory/dir'
      )
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
  })

  it('fires the prefetch function on hover', async () => {
    render(
      <CommitDirEntry commitSha="1234" name="dir" path="path/to/directory" />,
      { wrapper }
    )

    userEvent.hover(screen.getByText('dir'))

    await waitFor(() => queryClient.getQueryState().isFetching)
    await waitFor(() => !queryClient.getQueryState().isFetching)

    await waitFor(() =>
      expect(queryClient.getQueryState().data).toStrictEqual({
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
})
