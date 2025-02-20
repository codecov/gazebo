import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import CommitFileEntry from './CommitFileEntry'

import { displayTypeParameter } from '../../constants'

const mockData = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        commitid: 'f00162848a3cebc0728d915763c2fd9e92132408',
        coverageAnalytics: {
          flagNames: ['a', 'b'],
          components: [],
          coverageFile: {
            hashedPath: 'hashed-path',
            content:
              'import pytest\nfrom path1 import index\n\ndef test_uncovered_if():\n    assert index.uncovered_if() == False\n\ndef test_fully_covered():\n    assert index.fully_covered() == True\n\n',
            coverage: [
              { line: 1, coverage: 'H' },
              { line: 2, coverage: 'P' },
              { line: 4, coverage: 'H' },
              { line: 5, coverage: 'M' },
              { line: 7, coverage: 'H' },
              { line: 8, coverage: 'H' },
            ],
            totals: {
              percentCovered: 66.67,
            },
          },
        },
      },
      branch: null,
    },
  },
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
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
    const mockVars = vi.fn()

    server.use(
      graphql.query('CoverageForFile', (info) => {
        mockVars(info.variables)

        return HttpResponse.json({ data: mockData })
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
          displayType={displayTypeParameter.list}
        />,
        { wrapper }
      )

      const path = screen.getByRole('link', { name: 'dir/file.js' })
      expect(path).toBeInTheDocument()
      expect(path).toHaveAttribute(
        'href',
        '/gh/codecov/test-repo/commit/1234/blob/dir/file.js?dropdown=coverage'
      )
    })

    describe('filters with flags key passed', () => {
      it('sets the correct query params', () => {
        setup()
        render(
          <CommitFileEntry
            commitSha="1234"
            path="dir/file.js"
            name="file.js"
            urlPath="dir"
            displayType={displayTypeParameter.list}
            filters={{ flags: ['flag-1'] }}
          />,
          { wrapper }
        )

        const path = screen.getByRole('link', { name: 'dir/file.js' })
        expect(path).toBeInTheDocument()
        expect(path).toHaveAttribute(
          'href',
          '/gh/codecov/test-repo/commit/1234/blob/dir/file.js?flags%5B0%5D=flag-1&dropdown=coverage'
        )
      })
    })

    describe('filters with flags and components are passed', () => {
      it('sets the correct query params', () => {
        setup()
        render(
          <CommitFileEntry
            commitSha="1234"
            path="dir/file.js"
            name="file.js"
            urlPath="dir"
            displayType={displayTypeParameter.list}
            filters={{ flags: ['flag-1'], components: ['component-test'] }}
          />,
          { wrapper }
        )

        const path = screen.getByRole('link', { name: 'dir/file.js' })
        expect(path).toBeInTheDocument()
        expect(path).toHaveAttribute(
          'href',
          '/gh/codecov/test-repo/commit/1234/blob/dir/file.js?flags%5B0%5D=flag-1&components%5B0%5D=component-test&dropdown=coverage'
        )
      })
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
          displayType={displayTypeParameter.tree}
        />,
        { wrapper }
      )

      const path = screen.getByRole('link', { name: /file.js/ })
      expect(path).toBeInTheDocument()
      expect(path).toHaveAttribute(
        'href',
        '/gh/codecov/test-repo/commit/1234/blob/dir/file.js?dropdown=coverage'
      )
    })

    it('does not display the file path label', () => {
      setup()
      render(
        <CommitFileEntry
          commitSha="1234"
          path="dir/file.js"
          name="file.js"
          urlPath="dir"
          displayType={displayTypeParameter.tree}
        />,
        { wrapper }
      )

      const path = screen.queryByText('dir/file.js')
      expect(path).not.toBeInTheDocument()
    })

    describe('filters with flags key passed', () => {
      it('sets the correct query params', () => {
        setup()
        render(
          <CommitFileEntry
            commitSha="1234"
            path="dir/file.js"
            name="file.js"
            urlPath="dir"
            displayType={displayTypeParameter.tree}
            filters={{ flags: ['flag-1'] }}
          />,
          { wrapper }
        )

        const path = screen.getByRole('link', { name: /file.js/ })
        expect(path).toBeInTheDocument()
        expect(path).toHaveAttribute(
          'href',
          '/gh/codecov/test-repo/commit/1234/blob/dir/file.js?flags%5B0%5D=flag-1&dropdown=coverage'
        )
      })
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
          displayType={displayTypeParameter.tree}
        />,
        { wrapper }
      )

      await user.hover(screen.getByText('file.js'))
      const queryKey = queryClient
        .getQueriesData({})
        ?.at(0)
        ?.at(0) as Array<string>

      await waitFor(() =>
        expect(queryClient.getQueryState(queryKey)?.data).toStrictEqual({
          content:
            'import pytest\nfrom path1 import index\n\ndef test_uncovered_if():\n    assert index.uncovered_if() == False\n\ndef test_fully_covered():\n    assert index.fully_covered() == True\n\n',
          coverage: {
            1: 'H',
            2: 'P',
            4: 'H',
            5: 'M',
            7: 'H',
            8: 'H',
          },
          flagNames: ['a', 'b'],
          componentNames: [],

          totals: 66.67,
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
              displayType={displayTypeParameter.tree}
              filters={{ flags: ['flag-1'] }}
            />,
            { wrapper }
          )

          const file = await screen.findByText('file.js')
          await user.hover(file)

          await waitFor(() => expect(mockVars).toHaveBeenCalled())
          await waitFor(() =>
            expect(mockVars).toHaveBeenCalledWith(
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
              displayType={displayTypeParameter.tree}
              filters={{ flags: [] }}
            />,
            { wrapper }
          )

          const file = await screen.findByText('file.js')
          await user.hover(file)

          await waitFor(() => expect(mockVars).toHaveBeenCalled())
          await waitFor(() =>
            expect(mockVars).toHaveBeenCalledWith(
              expect.objectContaining({ flags: [] })
            )
          )
        })
      })
    })
  })
})
