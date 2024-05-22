import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route, useLocation } from 'react-router-dom'

import BundlesTab from './BundlesTab'

jest.mock('./BundleContent', () => () => <div>BundleContent</div>)
jest.mock('./BundleOnboarding', () => () => <div>BundleOnboarding</div>)

const mockRepoOverview = ({
  coverageEnabled = true,
  bundleAnalysisEnabled = true,
  language = '',
}) => {
  const languages = ['python']
  if (language !== '') {
    languages.push(language)
  }

  return {
    owner: {
      repository: {
        __typename: 'Repository',
        private: false,
        defaultBranch: 'main',
        oldestCommitAt: '2022-10-10T11:59:59',
        coverageEnabled,
        bundleAnalysisEnabled,
        languages,
      },
    },
  }
}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      suspense: true,
    },
  },
})
let testLocation: ReturnType<typeof useLocation>
const wrapper =
  (
    initialEntries = '/gh/test-owner/test-repo/bundles'
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route path="/:provider/:owner/:repo/bundles">
            <Suspense fallback={<p>Loading</p>}>{children}</Suspense>
          </Route>
          <Route
            path="*"
            render={({ location }) => {
              testLocation = location
              return null
            }}
          />
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

interface SetupArgs {
  coverageEnabled?: boolean
  bundleAnalysisEnabled?: boolean
  language?: string
}

describe('BundlesTab', () => {
  function setup({
    coverageEnabled = true,
    bundleAnalysisEnabled = true,
    language,
  }: SetupArgs) {
    server.use(
      graphql.query('GetRepoOverview', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data(
            mockRepoOverview({
              coverageEnabled,
              bundleAnalysisEnabled,
              language,
            })
          )
        )
      })
    )
  }

  describe('bundle content route', () => {
    it('renders BundleContent', async () => {
      setup({ bundleAnalysisEnabled: true })
      render(<BundlesTab />, {
        wrapper: wrapper(),
      })

      const bundleContent = await screen.findByText('BundleContent')
      expect(bundleContent).toBeInTheDocument()
    })
  })

  describe('no bundle analysis or js/ts present', () => {
    it('redirects to coverage tab', async () => {
      setup({ bundleAnalysisEnabled: false, language: 'python' })
      render(<BundlesTab />, {
        wrapper: wrapper(),
      })

      const loader = await screen.findByText('Loading')
      await waitForElementToBeRemoved(loader)

      await waitFor(() =>
        expect(testLocation.pathname).toBe('/gh/test-owner/test-repo')
      )
    })
  })
})
