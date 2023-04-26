import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import BranchFileEntry from './BranchFileEntry'

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
            'import pytest\nfrom path1 import index\n\ndef test_uncovered_if():\n    assert index.uncovered_if() == False\n\ndef test_fully_covered():\n    assert index.fully_covered() == True\n\n\n\n\n',
          coverage: [
            {
              line: 1,
              coverage: 1,
            },
            {
              line: 2,
              coverage: 1,
            },
            {
              line: 4,
              coverage: 1,
            },
            {
              line: 5,
              coverage: 1,
            },
            {
              line: 7,
              coverage: 1,
            },
            {
              line: 8,
              coverage: 1,
            },
          ],
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

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/test-repo']}>
      <Route path="/:provider/:owner/:repo/">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('BranchFileEntry', () => {
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

    it('displays the file path', async () => {
      render(
        <BranchFileEntry
          branch="main"
          path="dir/file.js"
          name="file.js"
          urlPath="dir"
          isCriticalFile={false}
          displayType={displayTypeParameter.list}
        />,
        { wrapper }
      )

      const file = await screen.findByText('dir/file.js')
      expect(file).toBeInTheDocument()
    })
  })

  describe('checking properties on tree display', () => {
    beforeEach(() => {
      setup()
    })

    it('displays the file name', async () => {
      render(
        <BranchFileEntry
          branch="main"
          path="dir/file.js"
          name="file.js"
          urlPath="dir"
          isCriticalFile={false}
          displayType={displayTypeParameter.tree}
        />,
        { wrapper }
      )

      const file = await screen.findByText('file.js')
      expect(file).toBeInTheDocument()
    })

    it('does not display the file name', async () => {
      render(
        <BranchFileEntry
          branch="main"
          path="dir/file.js"
          name="file.js"
          urlPath="dir"
          isCriticalFile={false}
          displayType={displayTypeParameter.tree}
        />,
        { wrapper }
      )

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      const file = screen.queryByText('dir/file.js')
      expect(file).not.toBeInTheDocument()
    })
  })

  describe('file is a critical file', () => {
    beforeEach(() => {
      setup()
    })

    it('displays critical file label', async () => {
      render(
        <BranchFileEntry
          branch="main"
          path="dir/file.js"
          name="file.js"
          urlPath="dir"
          isCriticalFile={true}
          displayType={displayTypeParameter.list}
        />,
        { wrapper }
      )

      const file = await screen.findByText('Critical File')
      expect(file).toBeInTheDocument()
    })
  })

  describe('is displaying a list', () => {
    beforeEach(() => {
      setup()
    })

    it('displays the file path label', async () => {
      render(
        <BranchFileEntry
          branch="main"
          path="dir/file.js"
          name="file.js"
          urlPath="dir"
          isCriticalFile={false}
          displayType={displayTypeParameter.list}
        />,
        { wrapper }
      )

      const file = await screen.findByText('dir/file.js')
      expect(file).toBeInTheDocument()
    })
  })

  describe('prefetches data', () => {
    beforeEach(() => {
      setup()
    })

    it('fires the prefetch function on hover', async () => {
      const user = userEvent.setup()
      render(
        <BranchFileEntry
          branch="main"
          path="dir/file.js"
          name="file.js"
          urlPath="dir"
          isCriticalFile={false}
          displayType={displayTypeParameter.tree}
        />,
        { wrapper }
      )

      const file = await screen.findByText('file.js')
      await user.hover(file)

      await waitFor(() => queryClient.getQueryState().isFetching)
      await waitFor(() => !queryClient.getQueryState().isFetching)

      await waitFor(() =>
        expect(queryClient.getQueryState().data.content).toBe(
          mockData.owner.repository.commit.coverageFile.content
        )
      )
      await waitFor(() =>
        expect(queryClient.getQueryState().data.coverage).toStrictEqual({
          1: 1,
          2: 1,
          4: 1,
          5: 1,
          7: 1,
          8: 1,
        })
      )
      await waitFor(() =>
        expect(queryClient.getQueryState().data.flagNames).toStrictEqual([
          'a',
          'b',
        ])
      )
      await waitFor(() =>
        expect(queryClient.getQueryState().data.isCriticalFile).toBe(true)
      )
      await waitFor(() =>
        expect(queryClient.getQueryState().data.totals).toBe(0)
      )
    })
  })
})
