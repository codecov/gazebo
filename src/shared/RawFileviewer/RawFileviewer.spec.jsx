import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import RawFileviewer from './RawFileviewer'

jest.mock(
  'ui/FileViewer/ToggleHeader/ToggleHeader',
  () => () => 'The FileViewer Toggle Header'
)
jest.mock(
  'ui/CodeRenderer/CodeRendererProgressHeader',
  () => () => 'The Progress Header for CodeRenderer'
)

const queryClient = new QueryClient()
const server = setupServer()

const wrapper =
  (initialEntries = ['/gh/codecov/cool-repo/blob/branch-name/a/file.js']) =>
  ({ children }) =>
    (
      <MemoryRouter initialEntries={initialEntries}>
        <Route
          path={[
            '/:provider/:owner/:repo/blob/:ref/:path+',
            '/:provider/:owner/:repo/commit/:commit/blob/:path+',
          ]}
        >
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </Route>
      </MemoryRouter>
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

describe('RawFileviewer', () => {
  function setup({ content, owner, coverage, isCriticalFile }) {
    server.use(
      graphql.query('DetailOwner', (req, res, ctx) =>
        res(ctx.status(200), ctx.data({ owner }))
      ),
      graphql.query('CoverageForFile', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({
            owner: {
              repository: {
                commit: {
                  commitid: 1,
                  flagNames: ['flag1', 'flag2'],
                  coverageFile: {
                    isCriticalFile,
                    content,
                    coverage,
                    totals: {
                      coverage,
                    },
                  },
                },
              },
            },
          })
        )
      )
    )
  }

  describe('when there is content to be shown', () => {
    beforeEach(() => {
      const content =
        'function add(a, b) {\n    return a + b;\n}\n\nfunction subtract(a, b) {\n    return a - b;\n}\n\nfunction multiply(a, b) {\n    return a * b;\n}\n\nfunction divide(a, b) {\n    if (b !== 0) {\n        return a / b;\n    } else {\n        return 0\n    }\n}\n\nmodule.exports = {add, subtract, multiply, divide};'
      const owner = {
        username: 'criticalrole',
        isCurrentUserPartOfOrg: true,
      }
      const coverage = {
        1: 'H',
        2: 'H',
        5: 'H',
        6: 'H',
        9: 'H',
        10: 'H',
        13: 'M',
        14: 'P',
        15: 'M',
        16: 'M',
        17: 'M',
        21: 'H',
      }
      const isCriticalFile = false
      setup({ content, owner, coverage, isCriticalFile })
    })

    describe('getting data from ref', () => {
      it('renders the FileViewer Header, CodeRenderer Header, and CodeRenderer', async () => {
        render(<RawFileviewer />, { wrapper: wrapper() })

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)

        const toggleHeader = await screen.findByText(
          /The FileViewer Toggle Header/
        )
        expect(toggleHeader).toBeInTheDocument()

        const progressHeader = await screen.findByText(
          /The Progress Header for CodeRenderer/
        )
        expect(progressHeader).toBeInTheDocument()

        const errorMessage = screen.queryByText(
          /There was a problem getting the source code from your provider./
        )
        expect(errorMessage).not.toBeInTheDocument()

        const allTestIds = await screen.findAllByTestId('fv-single-line')
        expect(allTestIds.length).toEqual(21)
      })
    })

    describe('getting data from commit', () => {
      it('renders the FileViewer Header, CodeRenderer Header, and CodeRenderer', async () => {
        render(<RawFileviewer />, {
          wrapper: wrapper([
            '/gh/codecov/cool-repo/commit/sha256/blob/a/file.js',
          ]),
        })

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)

        const toggleHeader = await screen.findByText(
          /The FileViewer Toggle Header/
        )
        expect(toggleHeader).toBeInTheDocument()

        const progressHeader = await screen.findByText(
          /The Progress Header for CodeRenderer/
        )
        expect(progressHeader).toBeInTheDocument()

        const errorMessage = screen.queryByText(
          /There was a problem getting the source code from your provider./
        )
        expect(errorMessage).not.toBeInTheDocument()

        const allTestIds = await screen.findAllByTestId('fv-single-line')
        expect(allTestIds.length).toEqual(21)
      })
    })
  })

  describe('when the file is labeled critical', () => {
    beforeEach(() => {
      const content =
        'function add(a, b) {\n    return a + b;\n}\n\nfunction subtract(a, b) {\n    return a - b;\n}\n\nfunction multiply(a, b) {\n    return a * b;\n}\n\nfunction divide(a, b) {\n    if (b !== 0) {\n        return a / b;\n    } else {\n        return 0\n    }\n}\n\nmodule.exports = {add, subtract, multiply, divide};'
      const owner = {
        username: 'criticalrole',
        isCurrentUserPartOfOrg: true,
      }
      const coverage = {
        1: 'H',
        2: 'H',
        5: 'H',
        6: 'H',
        9: 'H',
        10: 'H',
        13: 'M',
        14: 'P',
        15: 'M',
        16: 'M',
        17: 'M',
        21: 'H',
      }
      const isCriticalFile = true
      setup({ content, owner, coverage, isCriticalFile })
    })

    it('renders the FileViewer Header, CriticalFileLabel, CodeRenderer Header, and CodeRenderer', async () => {
      render(<RawFileviewer />, { wrapper: wrapper() })

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      const toggleHeader = await screen.findByText(
        /The FileViewer Toggle Header/
      )
      expect(toggleHeader).toBeInTheDocument()

      const criticalFile = await screen.findByText(/critical file/i)
      expect(criticalFile).toBeInTheDocument()

      const codeRenderer = await screen.findByText(
        /The Progress Header for CodeRenderer/
      )
      expect(codeRenderer).toBeInTheDocument()

      const errorMessage = screen.queryByText(
        /There was a problem getting the source code from your provider./
      )
      expect(errorMessage).not.toBeInTheDocument()

      const allTestIds = await screen.findAllByTestId('fv-single-line')
      expect(allTestIds.length).toEqual(21)
    })
  })

  describe('when there is no coverage data to be shown', () => {
    beforeEach(() => {
      const content =
        'function add(a, b) {\n    return a + b;\n}\n\nfunction subtract(a, b) {\n    return a - b;\n}\n\nfunction multiply(a, b) {\n    return a * b;\n}\n\nfunction divide(a, b) {\n    if (b !== 0) {\n        return a / b;\n    } else {\n        return 0\n    }\n}\n\nmodule.exports = {add, subtract, multiply, divide};'
      const owner = {
        username: 'cool-username',
        isCurrentUserPartOfOrg: true,
      }
      const coverage = null
      const isCriticalFile = false
      setup({ content, owner, coverage, isCriticalFile })
    })

    it('renders the Fileviewer Header, CodeRenderer Header, and CodeRenderer', async () => {
      render(<RawFileviewer />, { wrapper: wrapper() })

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      const toggleHeader = await screen.findByText(
        /The FileViewer Toggle Header/
      )
      expect(toggleHeader).toBeInTheDocument()

      const progressHeader = await screen.findByText(
        /The Progress Header for CodeRenderer/
      )
      expect(progressHeader).toBeInTheDocument()

      const errorMessage = screen.queryByText(
        /There was a problem getting the source code from your provider./
      )
      expect(errorMessage).not.toBeInTheDocument()

      const allTestIds = await screen.findAllByTestId('fv-single-line')
      expect(allTestIds.length).toEqual(21)
    })
  })

  describe('when there is no owner data to be shown', () => {
    beforeEach(() => {
      setup({
        owner: null,
        coverage: {
          1: 'H',
          2: 'H',
          5: 'H',
          6: 'H',
          9: 'H',
          10: 'H',
          13: 'M',
          14: 'P',
          15: 'M',
          16: 'M',
          17: 'M',
          21: 'H',
        },
      })
    })

    it('renders the 404 message', async () => {
      render(<RawFileviewer />, { wrapper: wrapper() })

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      const notFound = await screen.findByText(/Not found/)
      expect(notFound).toBeInTheDocument()

      const four0four = await screen.findByText(/404/)
      expect(four0four).toBeInTheDocument()
    })
  })

  describe('when there is an owner but no content to be shown', () => {
    beforeEach(() => {
      const owner = {
        username: 'cool-user',
        isCurrentUserPartOfOrg: true,
      }
      setup({ content: null, owner, coverage: null })
    })

    it('renders the Fileviewer Header, CodeRenderer Header, and error message', async () => {
      render(<RawFileviewer />, { wrapper: wrapper() })

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      const toggleHeader = await screen.findByText(
        /The FileViewer Toggle Header/
      )
      expect(toggleHeader).toBeInTheDocument()

      const progressHeader = await screen.findByText(
        /The Progress Header for CodeRenderer/
      )
      expect(progressHeader).toBeInTheDocument()

      const codeRenderer = screen.queryByText(/The CodeRenderer/)
      expect(codeRenderer).not.toBeInTheDocument()

      const errorMessage = await screen.findByText(
        /There was a problem getting the source code from your provider./
      )
      expect(errorMessage).toBeInTheDocument()
    })
  })

  describe('user passes false to showTopBorder prop', () => {
    beforeEach(() => {
      const owner = {
        username: 'cool-user',
        isCurrentUserPartOfOrg: true,
      }
      setup({ content: null, owner, coverage: null })
    })

    it('does not apply the border class', async () => {
      render(<RawFileviewer showTopBorder={false} />, { wrapper: wrapper() })

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      const fileViewer = await screen.findByTestId('file-viewer-wrapper')
      expect(fileViewer).toHaveClass('flex')
      expect(fileViewer).not.toHaveClass('border-t')
    })
  })

  describe('user passes false to addTopPadding prop', () => {
    beforeEach(() => {
      const owner = {
        username: 'cool-user',
        isCurrentUserPartOfOrg: true,
      }
      setup({ content: null, owner, coverage: null })
    })

    it('does not apply the border class', async () => {
      render(<RawFileviewer addTopPadding={false} />, { wrapper: wrapper() })

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      const fileViewer = await screen.findByTestId('file-viewer-wrapper')
      expect(fileViewer).toHaveClass('flex')
      expect(fileViewer).not.toHaveClass('pt-6')
    })
  })
})
