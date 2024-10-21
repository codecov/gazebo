import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import BranchFileEntry from './BranchFileEntry'

import { displayTypeParameter } from '../../constants'

const mockData = {
  owner: {
    repository: {
      commit: {
        commitid: 'f00162848a3cebc0728d915763c2fd9e92132408',
        coverageAnalytics: {
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
      },
      branch: null,
    },
  },
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper =
  (initialEntries = ['/gh/codecov/test-repo/']) =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/:provider/:owner/:repo/">{children}</Route>
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

describe('BranchFileEntry', () => {
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
    it('displays the file path', async () => {
      setup()

      render(
        <BranchFileEntry
          branch="main"
          path="dir/file.js"
          name="file.js"
          urlPath="dir"
          isCriticalFile={false}
          displayType={displayTypeParameter.list}
        />,
        { wrapper: wrapper() }
      )

      const file = await screen.findByText('dir/file.js')
      expect(file).toBeInTheDocument()
    })
  })

  describe('checking properties on tree display', () => {
    it('displays the file name', async () => {
      setup()

      render(
        <BranchFileEntry
          branch="main"
          path="dir/file.js"
          name="file.js"
          urlPath="dir"
          isCriticalFile={false}
          displayType={displayTypeParameter.tree}
        />,
        { wrapper: wrapper() }
      )

      const file = await screen.findByText('file.js')
      expect(file).toBeInTheDocument()
    })

    it('does not display the file name', async () => {
      setup()

      render(
        <BranchFileEntry
          branch="main"
          path="dir/file.js"
          name="file.js"
          urlPath="dir"
          isCriticalFile={false}
          displayType={displayTypeParameter.tree}
        />,
        { wrapper: wrapper() }
      )

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      const file = screen.queryByText('dir/file.js')
      expect(file).not.toBeInTheDocument()
    })
  })

  describe('file is a critical file', () => {
    it('displays critical file label', async () => {
      setup()

      render(
        <BranchFileEntry
          branch="main"
          path="dir/file.js"
          name="file.js"
          urlPath="dir"
          isCriticalFile={true}
          displayType={displayTypeParameter.list}
        />,
        { wrapper: wrapper() }
      )

      const file = await screen.findByText('Critical File')
      expect(file).toBeInTheDocument()
    })
  })

  describe('is displaying a list', () => {
    it('displays the file path label', async () => {
      setup()

      render(
        <BranchFileEntry
          branch="main"
          path="dir/file.js"
          name="file.js"
          urlPath="dir"
          isCriticalFile={false}
          displayType={displayTypeParameter.list}
        />,
        { wrapper: wrapper() }
      )

      const file = await screen.findByText('dir/file.js')
      expect(file).toBeInTheDocument()
    })
  })

  describe('flags filters is set', () => {
    it('sets the correct href', async () => {
      setup()
      render(
        <BranchFileEntry
          branch="main"
          path="dir/file.js"
          name="file.js"
          urlPath="dir"
          isCriticalFile={false}
          displayType={displayTypeParameter.tree}
        />,
        {
          wrapper: wrapper([
            '/gh/codecov/test-repo/blob/main/dir%2Ffile.js?flags%5B0%5D=flag-1',
          ]),
        }
      )

      const a = await screen.findByRole('link')
      expect(a).toHaveAttribute(
        'href',
        '/gh/codecov/test-repo/blob/main/dir%2Ffile.js?flags%5B0%5D=flag-1'
      )
    })
  })

  describe('flags and components filter is passed', () => {
    it('sets the correct href', async () => {
      setup()
      render(
        <BranchFileEntry
          branch="main"
          path="dir/file.js"
          name="file.js"
          urlPath="dir"
          isCriticalFile={false}
          displayType={displayTypeParameter.tree}
        />,
        {
          wrapper: wrapper([
            '/gh/codecov/test-repo/blob/main/dir%2Ffile.js?flags%5B0%5D=flag-1&components%5B0%5D=component-3.1415924',
          ]),
        }
      )

      const a = await screen.findByRole('link')
      expect(a).toHaveAttribute(
        'href',
        '/gh/codecov/test-repo/blob/main/dir%2Ffile.js?flags%5B0%5D=flag-1&components%5B0%5D=component-3.1415924'
      )
    })
  })

  describe('prefetches data', () => {
    it('fires the prefetch function on hover', async () => {
      const { user } = setup()

      render(
        <BranchFileEntry
          branch="main"
          path="dir/file.js"
          name="file.js"
          urlPath="dir"
          isCriticalFile={false}
          displayType={displayTypeParameter.tree}
        />,
        { wrapper: wrapper() }
      )

      const file = await screen.findByText('file.js')
      await user.hover(file)

      await waitFor(() => queryClient.getQueryState().isFetching)
      await waitFor(() => !queryClient.getQueryState().isFetching)

      await waitFor(() =>
        expect(queryClient.getQueryState().data.content).toBe(
          mockData.owner.repository.commit.coverageAnalytics.coverageFile
            .content
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

    describe('filters arg is passed', () => {
      describe('there are more then zero flag', () => {
        it('calls the request with the flags arg with the provided flag', async () => {
          const { user, mockVars } = setup()

          render(
            <BranchFileEntry
              branch="main"
              path="dir/file.js"
              name="file.js"
              urlPath="dir"
              isCriticalFile={false}
              displayType={displayTypeParameter.tree}
            />,
            {
              wrapper: wrapper([
                '/gh/codecov/test-repo/blob/main/dir%2Ffile.js?flags%5B0%5D=flag-1&components%5B0%5D=component-3.1415924',
              ]),
            }
          )

          const file = await screen.findByText('file.js')
          await user.hover(file)

          await waitFor(() => queryClient.getQueryState().isFetching)
          await waitFor(() => !queryClient.getQueryState().isFetching)

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
            <BranchFileEntry
              branch="main"
              path="dir/file.js"
              name="file.js"
              urlPath="dir"
              isCriticalFile={false}
              displayType={displayTypeParameter.tree}
              filters={{ flags: [] }}
            />,
            { wrapper: wrapper() }
          )

          const file = await screen.findByText('file.js')
          await user.hover(file)

          await waitFor(() => queryClient.getQueryState().isFetching)
          await waitFor(() => !queryClient.getQueryState().isFetching)

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
