import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import CommitFileEntry from './CommitFileEntry'

import { displayTypeParameter } from '../../constants'

const mockData = {
  commit: {
    commitid: 'f00162848a3cebc0728d915763c2fd9e92132408',
    flagNames: ['a', 'b'],
    coverageFile: {
      isCriticalFile: true,
      hashedPath: 'hashed-path',
      totals: null,
      content:
        'import pytest\nfrom path1 import index\n\ndef test_uncovered_if():\n',
      coverage: [
        {
          line: 1,
          coverage: 'H',
        },
        {
          line: 2,
          coverage: 'H',
        },
      ],
    },
  },
  branch: null,
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter
      initialEntries={['/gh/codecov/test-repo/coolCommitSha/blob/file.js']}
    >
      <Route path="/:provider/:owner/:repo/:commit/blob/:path+">
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

describe('CommitFileEntry', () => {
  function setup() {
    const user = userEvent.setup()
    const mockVars = jest.fn()

    server.use(
      graphql.query('CoverageForFile', (req, res, ctx) => {
        mockVars(req.variables)

        return res(
          ctx.status(200),
          ctx.data({ owner: { repository: mockData } })
        )
      })
    )

    return { user, mockVars }
  }

  describe('checking properties on list display', () => {
    it('displays the file path', () => {
      setup()
      render(
        <CommitFileEntry
          commitSha="1234"
          path="dir/file.js"
          name="file.js"
          urlPath="dir"
          isCriticalFile={false}
          displayType={displayTypeParameter.list}
        />,
        { wrapper }
      )

      expect(screen.getByText('dir/file.js')).toBeInTheDocument()
    })
  })

  describe('checking properties on tree display', () => {
    it('displays the file name', () => {
      setup()
      render(
        <CommitFileEntry
          commitSha="1234"
          path="dir/file.js"
          name="file.js"
          urlPath="dir"
          isCriticalFile={false}
          displayType={displayTypeParameter.tree}
        />,
        { wrapper }
      )

      expect(screen.getByText('file.js')).toBeInTheDocument()
    })

    it('does not display the file name', () => {
      setup()
      render(
        <CommitFileEntry
          commitSha="1234"
          path="dir/file.js"
          name="file.js"
          urlPath="dir"
          isCriticalFile={false}
          displayType={displayTypeParameter.tree}
        />,
        { wrapper }
      )

      expect(screen.queryByText('dir/file.js')).not.toBeInTheDocument()
    })
  })

  describe('file is a critical file', () => {
    it('displays critical file label', () => {
      setup()
      render(
        <CommitFileEntry
          commitSha="1234"
          path="dir/file.js"
          name="file.js"
          urlPath="dir"
          isCriticalFile={true}
          displayType={displayTypeParameter.tree}
        />,
        { wrapper }
      )

      expect(screen.getByText('Critical File')).toBeInTheDocument()
    })
  })

  describe('is displaying a list', () => {
    it('displays the file path label', () => {
      setup()
      render(
        <CommitFileEntry
          commitSha="1234"
          path="dir/file.js"
          name="file.js"
          urlPath="dir"
          isCriticalFile={false}
          displayType={displayTypeParameter.list}
        />,
        { wrapper }
      )

      expect(screen.getByText('dir/file.js')).toBeInTheDocument()
    })
  })

  describe('prefetches data', () => {
    it('fires the prefetch function on hover', async () => {
      const { user } = setup()
      render(
        <CommitFileEntry
          commitSha="1234"
          path="dir/file.js"
          name="file.js"
          urlPath="dir"
          isCriticalFile={false}
          displayType={displayTypeParameter.tree}
        />,
        { wrapper }
      )

      await user.hover(screen.getByText('file.js'))

      await waitFor(() => queryClient.getQueryState().isFetching)
      await waitFor(() => !queryClient.getQueryState().isFetching)

      await waitFor(() =>
        expect(queryClient.getQueryState().data).toStrictEqual({
          content:
            'import pytest\nfrom path1 import index\n\ndef test_uncovered_if():\n',
          coverage: {
            1: 'H',
            2: 'H',
          },
          flagNames: ['a', 'b'],
          isCriticalFile: true,
          totals: 0,
          hashedPath: 'hashed-path',
        })
      )
    })

    describe('filters arg is passed', () => {
      describe('there are more then zero flag', () => {
        it('calls the request with the flags arg with the provided flag', async () => {
          const { user, mockVars } = setup()

          render(
            <CommitFileEntry
              commitSha="1234"
              path="dir/file.js"
              name="file.js"
              urlPath="dir"
              isCriticalFile={false}
              displayType={displayTypeParameter.tree}
              filters={{ flags: ['flag-1'] }}
            />,
            { wrapper }
          )

          const file = await screen.findByText('file.js')
          await user.hover(file)

          await waitFor(() => queryClient.getQueryState().isFetching)
          await waitFor(() => !queryClient.getQueryState().isFetching)

          await waitFor(() => expect(mockVars).toBeCalled())
          await waitFor(() =>
            expect(mockVars).toBeCalledWith(
              expect.objectContaining({ flags: ['flag-1'] })
            )
          )
        })
      })

      describe('there are zero flags', () => {
        it('calls the request with the flags arg with an empty array', async () => {
          const { user, mockVars } = setup()

          render(
            <CommitFileEntry
              commitSha="1234"
              path="dir/file.js"
              name="file.js"
              urlPath="dir"
              isCriticalFile={false}
              displayType={displayTypeParameter.tree}
              filters={{ flags: [] }}
            />,
            { wrapper }
          )

          const file = await screen.findByText('file.js')
          await user.hover(file)

          await waitFor(() => queryClient.getQueryState().isFetching)
          await waitFor(() => !queryClient.getQueryState().isFetching)

          await waitFor(() => expect(mockVars).toBeCalled())
          await waitFor(() =>
            expect(mockVars).toBeCalledWith(
              expect.objectContaining({ flags: [] })
            )
          )
        })
      })
    })
  })
})
