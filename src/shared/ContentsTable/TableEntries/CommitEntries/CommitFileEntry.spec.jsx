import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import CommitFileEntry from './CommitFileEntry'

import { displayTypeParameter } from '../../constants'

const mockData = {
  owner: {
    repository: {
      commit: {
        commitid: 'f00162848a3cebc0728d915763c2fd9e92132408',
        flagNames: ['a', 'b'],
        coverageFile: {
          isCriticalFile: true,
          content:
            'import pytest\nfrom path1 import index\n\ndef test_uncovered_if():\n',
          coverage: [
            {
              line: 1,
              coverage: 1,
            },
            {
              line: 2,
              coverage: 1,
            },
          ],
        },
      },
      branch: null,
    },
  },
}

const queryClient = new QueryClient()
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
    server.use(
      graphql.query('CoverageForFile', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockData))
      )
    )
  }

  describe('checking properties on list display', () => {
    beforeEach(() => {
      setup()
    })

    it('displays the file path', () => {
      render(
        <CommitFileEntry
          commitSha="1234"
          filePath="dir/file.js"
          name="file.js"
          path="dir"
          isCriticalFile={false}
          displayType={displayTypeParameter.list}
        />,
        { wrapper }
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
        <CommitFileEntry
          commitSha="1234"
          filePath="dir/file.js"
          name="file.js"
          path="dir"
          isCriticalFile={false}
          displayType={displayTypeParameter.tree}
        />,
        { wrapper }
      )

      expect(screen.getByText('file.js')).toBeInTheDocument()
    })

    it('does not display the file name', () => {
      render(
        <CommitFileEntry
          commitSha="1234"
          filePath="dir/file.js"
          name="file.js"
          path="dir"
          isCriticalFile={false}
          displayType={displayTypeParameter.tree}
        />,
        { wrapper }
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
        <CommitFileEntry
          commitSha="1234"
          filePath="dir/file.js"
          name="file.js"
          path="dir"
          isCriticalFile={true}
          displayType={displayTypeParameter.tree}
        />,
        { wrapper }
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
        <CommitFileEntry
          commitSha="1234"
          filePath="dir/file.js"
          name="file.js"
          path="dir"
          isCriticalFile={false}
          displayType={displayTypeParameter.list}
        />,
        { wrapper }
      )

      expect(screen.getByText('dir/file.js')).toBeInTheDocument()
    })
  })

  describe('prefetches data', () => {
    beforeEach(() => {
      setup()
    })

    it('fires the prefetch function on hover', async () => {
      render(
        <CommitFileEntry
          commitSha="1234"
          filePath="dir/file.js"
          name="file.js"
          path="dir"
          isCriticalFile={false}
          displayType={displayTypeParameter.tree}
        />,
        { wrapper }
      )

      userEvent.hover(screen.getByText('file.js'))

      await waitFor(() => queryClient.getQueryState().isFetching)
      await waitFor(() => !queryClient.getQueryState().isFetching)

      await waitFor(() =>
        expect(queryClient.getQueryState().data).toStrictEqual({
          content:
            'import pytest\nfrom path1 import index\n\ndef test_uncovered_if():\n',
          coverage: {
            1: 1,
            2: 1,
          },
          flagNames: ['a', 'b'],
          isCriticalFile: true,
          totals: 0,
        })
      )
    })
  })
})
