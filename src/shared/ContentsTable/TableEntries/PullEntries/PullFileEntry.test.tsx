import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'

import PullFileEntry from './PullFileEntry'

import { displayTypeParameter } from '../../constants'

const mockData = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        commitid: 'f00162848a3cebc0728d915763c2fd9e92132408',
        flagNames: ['a', 'b'],
        components: [],
        coverageFile: {
          isCriticalFile: true,
          hashedPath: 'hashed-path',
          content:
            'import pytest\nfrom path1 import index\n\ndef test_uncovered_if():\n    assert index.uncovered_if() == False\n\ndef test_fully_covered():\n    assert index.fully_covered() == True\n\n',
          coverage: [
            { line: 1, coverage: 'H' },
            { line: 2, coverage: 'P' },
            { line: 3, coverage: 'H' },
            { line: 4, coverage: 'M' },
            { line: 5, coverage: 'H' },
            { line: 6, coverage: 'H' },
          ],
          totals: {
            percentCovered: 66.67,
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

const wrapper: ({
  initialEntries,
}?: {
  initialEntries: string[]
}) => React.FC<React.PropsWithChildren> =
  (
    { initialEntries } = {
      initialEntries: ['/gh/codecov/test-repo/coolCommitSha/blob/file.js'],
    }
  ) =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
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

describe('PullFileEntry', () => {
  function setup() {
    server.use(
      graphql.query('CoverageForFile', (info) => {
        return HttpResponse.json({ data: mockData })
      })
    )
  }

  describe('checking properties on list display', () => {
    beforeEach(() => {
      setup()
    })

    it('displays the file path', () => {
      render(
        <PullFileEntry
          path="dir/file.js"
          name="file.js"
          urlPath="dir"
          isCriticalFile={false}
          commitSha="1234"
          displayType={displayTypeParameter.list}
        />,
        { wrapper: wrapper() }
      )

      expect(screen.getByText('dir/file.js')).toBeInTheDocument()
    })
  })

  describe('checking properties on tree display', () => {
    beforeEach(() => {
      setup()
    })

    it('displays the file name', () => {
      render(
        <PullFileEntry
          path="dir/file.js"
          name="file.js"
          urlPath="dir"
          isCriticalFile={false}
          commitSha="1234"
          displayType={displayTypeParameter.tree}
        />,
        { wrapper: wrapper() }
      )

      expect(screen.getByText('file.js')).toBeInTheDocument()
    })

    it('does not display the file name', () => {
      render(
        <PullFileEntry
          path="dir/file.js"
          name="file.js"
          urlPath="dir"
          isCriticalFile={false}
          commitSha="1234"
          displayType={displayTypeParameter.tree}
        />,
        { wrapper: wrapper() }
      )

      expect(screen.queryByText('dir/file.js')).not.toBeInTheDocument()
    })
  })

  describe('file is a critical file', () => {
    beforeEach(() => {
      setup()
    })

    it('displays critical file label', () => {
      render(
        <PullFileEntry
          path="dir/file.js"
          name="file.js"
          urlPath="dir"
          commitSha="1234"
          isCriticalFile={true}
          displayType={displayTypeParameter.tree}
        />,
        { wrapper: wrapper() }
      )

      expect(screen.getByText('Critical File')).toBeInTheDocument()
    })
  })

  describe('is displaying a list', () => {
    beforeEach(() => {
      setup()
    })

    it('displays the file path label', () => {
      render(
        <PullFileEntry
          path="dir/file.js"
          name="file.js"
          urlPath="dir"
          isCriticalFile={false}
          commitSha="1234"
          displayType={displayTypeParameter.list}
        />,
        { wrapper: wrapper() }
      )

      expect(screen.getByText('dir/file.js')).toBeInTheDocument()
    })
  })

  describe('prefetches data', () => {
    beforeEach(() => {
      setup()
    })

    it('fires the prefetch function on hover', async () => {
      const user = userEvent.setup()
      render(
        <PullFileEntry
          path="dir/file.js"
          name="file.js"
          urlPath="dir"
          isCriticalFile={false}
          commitSha="1234"
          displayType={displayTypeParameter.tree}
        />,
        { wrapper: wrapper() }
      )

      await user.hover(screen.getByText('file.js'))

      await waitFor(() => queryClient.isFetching())
      await waitFor(() => !queryClient.isFetching())

      const queryKey = queryClient
        .getQueriesData({})
        ?.at(0)
        ?.at(0) as Array<string>

      await waitFor(() =>
        expect(queryClient?.getQueryState(queryKey)?.data).toStrictEqual({
          content:
            'import pytest\nfrom path1 import index\n\ndef test_uncovered_if():\n    assert index.uncovered_if() == False\n\ndef test_fully_covered():\n    assert index.fully_covered() == True\n\n',
          coverage: {
            1: 'H',
            2: 'P',
            3: 'H',
            4: 'M',
            5: 'H',
            6: 'H',
          },
          flagNames: ['a', 'b'],
          componentNames: [],
          hashedPath: 'hashed-path',
          isCriticalFile: true,
          totals: 66.67,
        })
      )
    })
  })
  it('passes the flags filter through to the file link', () => {
    render(
      <PullFileEntry
        path="dir/file.js"
        name="file.js"
        urlPath="dir"
        isCriticalFile={false}
        commitSha="1234"
        displayType={displayTypeParameter.tree}
        filters={{ flags: ['a', 'b'] }}
      />,
      {
        wrapper: wrapper({
          initialEntries: ['/gh/codecov/test-repo/coolCommitSha/blob/file.js'],
        }),
      }
    )

    const a = screen.getByRole('link')
    expect(a).toHaveAttribute(
      'href',
      '/gh/codecov/test-repo/pull/undefined/blob/dir/file.js?flags%5B0%5D=a&flags%5B1%5D=b'
    )
  })
})
