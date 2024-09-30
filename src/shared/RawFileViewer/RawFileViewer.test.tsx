import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'

import RawFileViewer from './RawFileViewer'

const mocks = vi.hoisted(() => ({
  useFlags: vi.fn(),
  useScrollToLine: vi.fn(),
  captureMessage: vi.fn(),
}))

vi.mock('@sentry/react', async () => {
  const originalModule = await vi.importActual('@sentry/react')
  return {
    ...originalModule,
    withProfiler: (component: any) => component,
    captureMessage: mocks.captureMessage,
  }
})

vi.mock('shared/featureFlags', async () => {
  const originalModule = await vi.importActual('shared/featureFlags')
  return {
    ...originalModule,
    useFlags: mocks.useFlags,
  }
})

vi.mock('ui/CodeRenderer/hooks/useScrollToLine', async () => {
  const originalModule = await vi.importActual(
    'ui/CodeRenderer/hooks/useScrollToLine'
  )
  return {
    ...originalModule,
    useScrollToLine: mocks.useScrollToLine,
  }
})

window.requestAnimationFrame = (cb) => {
  cb(1)
  return 1
}
window.cancelAnimationFrame = () => {}
vi.mock('ui/FileViewer/ToggleHeader/ToggleHeader', () => ({
  default: () => 'The FileViewer',
}))
vi.mock('ui/CodeRenderer/CodeRendererProgressHeader', () => ({
  default: () => 'The Progress Header for CodeRenderer',
}))

window.requestAnimationFrame = (cb) => {
  cb(1)
  return 1
}
window.cancelAnimationFrame = () => {}

const scrollToMock = vi.fn()
window.scrollTo = scrollToMock
window.scrollX = 100

class ResizeObserverMock {
  callback = (x: any) => null

  constructor(callback: any) {
    this.callback = callback
  }

  observe() {
    this.callback([
      {
        contentRect: { width: 100 },
        target: {
          getAttribute: () => ({ scrollWidth: 100 }),
          getBoundingClientRect: () => ({ top: 100 }),
        },
      },
    ])
  }
  unobserve() {
    // do nothing
  }
  disconnect() {
    // do nothing
  }
}
global.window.ResizeObserver = ResizeObserverMock

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper =
  (
    initialEntries = ['/gh/codecov/cool-repo/blob/branch-name/a/file.js']
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
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

interface SetupArgs {
  content?: string | null
  owner?: {} | null
  coverage?: {} | null
  isCriticalFile?: boolean
}

describe('RawFileViewer', () => {
  function setup({ content, owner, coverage, isCriticalFile }: SetupArgs) {
    mocks.useFlags.mockReturnValue({ virtualFileRenderer: true })

    mocks.useScrollToLine.mockImplementation(() => ({
      lineRef: () => {},
      handleClick: vi.fn(),
      targeted: false,
    }))

    server.use(
      graphql.query('DetailOwner', (info) => {
        return HttpResponse.json({ data: { owner } })
      }),
      graphql.query('CoverageForFile', (info) => {
        return HttpResponse.json({
          data: {
            owner: {
              repository: {
                __typename: 'Repository',
                commit: {
                  commitid: '1',
                  coverageAnalytics: {
                    flagNames: ['flag1', 'flag2'],
                    components: [],
                    coverageFile: {
                      hashedPath: 'hashed-path',
                      isCriticalFile,
                      content,
                      coverage,
                      totals: {
                        percentCovered: 100,
                      },
                    },
                  },
                },
              },
            },
          },
        })
      })
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
      const coverage = [
        { line: 1, coverage: 'H' },
        { line: 2, coverage: 'H' },
        { line: 5, coverage: 'H' },
        { line: 6, coverage: 'H' },
        { line: 9, coverage: 'H' },
        { line: 10, coverage: 'H' },
        { line: 13, coverage: 'M' },
        { line: 14, coverage: 'P' },
        { line: 15, coverage: 'M' },
        { line: 16, coverage: 'M' },
        { line: 17, coverage: 'M' },
        { line: 21, coverage: 'H' },
      ]
      const isCriticalFile = false
      setup({ content, owner, coverage, isCriticalFile })
    })

    describe('getting data from ref', () => {
      it('renders the FileViewer Header, CodeRenderer Header, and VirtualFileRenderer', async () => {
        render(
          <RawFileViewer title="The FileViewer" commit="cool-commit-sha" />,
          { wrapper: wrapper() }
        )

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)

        const toggleHeader = await screen.findByText(/The FileViewer/)
        expect(toggleHeader).toBeInTheDocument()

        const progressHeader = await screen.findByText(
          /The Progress Header for CodeRenderer/
        )
        expect(progressHeader).toBeInTheDocument()

        await waitFor(() =>
          expect(
            screen.queryByText(
              /There was a problem getting the source code from your provider./
            )
          ).not.toBeInTheDocument()
        )

        const virtualFileRenderer = await screen.findByTestId(
          'virtual-file-renderer'
        )
        expect(virtualFileRenderer).toBeInTheDocument()
      })
    })

    describe('getting data from commit', () => {
      it('renders the FileViewer Header, CodeRenderer Header, and VirtualFileRenderer', async () => {
        render(
          <RawFileViewer title="The FileViewer" commit="cool-commit-sha" />,
          { wrapper: wrapper() }
        )

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)

        const toggleHeader = await screen.findByText(/The FileViewer/)
        expect(toggleHeader).toBeInTheDocument()

        const progressHeader = await screen.findByText(
          /The Progress Header for CodeRenderer/
        )
        expect(progressHeader).toBeInTheDocument()

        await waitFor(() =>
          expect(
            screen.queryByText(
              /There was a problem getting the source code from your provider./
            )
          ).not.toBeInTheDocument()
        )

        const virtualFileRenderer = await screen.findByTestId(
          'virtual-file-renderer'
        )
        expect(virtualFileRenderer).toBeInTheDocument()
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
      const coverage = [
        { line: 1, coverage: 'H' },
        { line: 2, coverage: 'H' },
        { line: 5, coverage: 'H' },
        { line: 6, coverage: 'H' },
        { line: 9, coverage: 'H' },
        { line: 10, coverage: 'H' },
        { line: 13, coverage: 'M' },
        { line: 14, coverage: 'P' },
        { line: 15, coverage: 'M' },
        { line: 16, coverage: 'M' },
        { line: 17, coverage: 'M' },
        { line: 21, coverage: 'H' },
      ]
      const isCriticalFile = true
      setup({ content, owner, coverage, isCriticalFile })
    })

    it('renders the FileViewer Header, CriticalFileLabel, CodeRenderer Header, and VirtualFileRenderer', async () => {
      render(
        <RawFileViewer title="The FileViewer" commit="cool-commit-sha" />,
        { wrapper: wrapper() }
      )

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      const toggleHeader = await screen.findByText(/The FileViewer/)
      expect(toggleHeader).toBeInTheDocument()

      const criticalFile = await screen.findByText(/critical file/i)
      expect(criticalFile).toBeInTheDocument()

      const codeRenderer = await screen.findByText(
        /The Progress Header for CodeRenderer/
      )
      expect(codeRenderer).toBeInTheDocument()

      await waitFor(() =>
        expect(
          screen.queryByText(
            /There was a problem getting the source code from your provider./
          )
        ).not.toBeInTheDocument()
      )

      const virtualFileRenderer = await screen.findByTestId(
        'virtual-file-renderer'
      )
      expect(virtualFileRenderer).toBeInTheDocument()
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

    it('renders the Fileviewer Header, CodeRenderer Header, and VirtualFileRenderer', async () => {
      render(
        <RawFileViewer title="The FileViewer" commit="cool-commit-sha" />,
        { wrapper: wrapper() }
      )

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      const toggleHeader = await screen.findByText(/The FileViewer/)
      expect(toggleHeader).toBeInTheDocument()

      const progressHeader = await screen.findByText(
        /The Progress Header for CodeRenderer/
      )
      expect(progressHeader).toBeInTheDocument()

      await waitFor(() =>
        expect(
          screen.queryByText(
            /There was a problem getting the source code from your provider./
          )
        ).not.toBeInTheDocument()
      )

      const virtualFileRenderer = await screen.findByTestId(
        'virtual-file-renderer'
      )
      expect(virtualFileRenderer).toBeInTheDocument()
    })
  })

  describe('when there is no owner data to be shown', () => {
    beforeEach(() => {
      setup({
        owner: null,
      })
    })

    it('renders the 404 message', async () => {
      render(
        <RawFileViewer title="The FileViewer" commit="cool-commit-sha" />,
        { wrapper: wrapper() }
      )

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

    it('renders the FileViewer Header, CodeRenderer Header, and error message', async () => {
      render(
        <RawFileViewer title="The FileViewer" commit="cool-commit-sha" />,
        { wrapper: wrapper() }
      )

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      const toggleHeader = await screen.findByText(/The FileViewer/)
      expect(toggleHeader).toBeInTheDocument()

      const progressHeader = await screen.findByText(
        /The Progress Header for CodeRenderer/
      )
      expect(progressHeader).toBeInTheDocument()

      await waitFor(() =>
        expect(screen.queryByText(/The CodeRenderer/)).not.toBeInTheDocument()
      )

      const errorMessage = await screen.findByText(
        /There was a problem getting the source code from your provider./
      )
      expect(errorMessage).toBeInTheDocument()
    })
  })

  describe('displaying unsupported file', () => {
    beforeEach(() => {
      const owner = {
        username: 'cool-user',
        isCurrentUserPartOfOrg: true,
      }
      setup({ content: null, owner, coverage: null })
    })

    it('shows the unsupported view component', async () => {
      render(
        <RawFileViewer title="The FileViewer" commit="cool-commit-sha" />,
        {
          wrapper: wrapper([
            '/gh/codecov/cool-repo/blob/branch-name/a/file.png',
          ]),
        }
      )

      const binaryFileText = await screen.findByText(
        'Unable to display contents of binary file included in coverage reports.'
      )
      expect(binaryFileText).toBeInTheDocument()
    })
  })
})
