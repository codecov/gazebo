import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import BranchDirEntry from './BranchDirEntry'

const mockData = {
  owner: {
    username: 'codecov',
    repository: {
      repositoryConfig: {
        indicationRange: {
          upperRange: 80,
          lowerRange: 60,
        },
      },
      branch: {
        head: {
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
          __typename: 'PathContents',
        },
      },
    },
  },
}

const queryClient = new QueryClient()
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/test-repo/tree/main/src']}>
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
    server.use(
      graphql.query('BranchContents', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockData))
      )
    )
  }

  beforeEach(() => {
    setup()
  })

  it('displays the directory name', async () => {
    render(
      <BranchDirEntry branch="branch" name="dir" urlPath="path/to/directory" />,
      { wrapper }
    )

    const dir = await screen.findByText('dir')
    expect(dir).toBeInTheDocument()
  })

  it('sets the correct href', async () => {
    render(
      <BranchDirEntry branch="branch" name="dir" urlPath="path/to/directory" />,
      { wrapper }
    )

    const a = await screen.findByRole('link')
    expect(a).toHaveAttribute(
      'href',
      '/gh/codecov/test-repo/tree/branch/path/to/directory/dir'
    )
  })

  it('fires the prefetch function on hover', async () => {
    const user = userEvent.setup()
    render(
      <BranchDirEntry branch="branch" name="dir" urlPath="path/to/directory" />,
      { wrapper }
    )

    await user.hover(screen.getByText('dir'))

    await waitFor(() => queryClient.getQueryState().isFetching)
    await waitFor(() => !queryClient.getQueryState().isFetching)

    await waitFor(() =>
      expect(queryClient.getQueryState().data).toStrictEqual({
        __typename: 'PathContents',
        indicationRange: {
          upperRange: 80,
          lowerRange: 60,
        },
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
