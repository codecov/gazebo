import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

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
const wrapper =
  (
    initialEntries = '/gh/test-owner/test-repo/bundles'
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route
            path={[
              '/:provider/:owner/:repo/bundles',
              '/:provider/:owner/:repo/bundles/new',
              '/:provider/:owner/:repo/bundles/new/rollup',
              '/:provider/:owner/:repo/bundles/new/webpack',
            ]}
          >
            <Suspense fallback={<p>Loading</p>}>{children}</Suspense>
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

  describe('onboarding routes', () => {
    describe('root onboarding route', () => {
      it('renders BundleOnboarding', async () => {
        setup({ bundleAnalysisEnabled: false, language: 'javascript' })
        render(<BundlesTab />, {
          wrapper: wrapper('/gh/test-owner/test-owner/bundles/new'),
        })

        const bundleOnboarding = await screen.findByText('BundleOnboarding')
        expect(bundleOnboarding).toBeInTheDocument()
      })
    })

    describe('rollup onboarding route', () => {
      it('renders BundleOnboarding', async () => {
        setup({ bundleAnalysisEnabled: false, language: 'javascript' })
        render(<BundlesTab />, {
          wrapper: wrapper('/gh/test-owner/test-owner/bundles/new/rollup'),
        })

        const bundleOnboarding = await screen.findByText('BundleOnboarding')
        expect(bundleOnboarding).toBeInTheDocument()
      })
    })

    describe('webpack onboarding route', () => {
      it('renders BundleOnboarding', async () => {
        setup({ bundleAnalysisEnabled: false, language: 'javascript' })
        render(<BundlesTab />, {
          wrapper: wrapper('/gh/test-owner/test-owner/bundles/new/webpack'),
        })

        const bundleOnboarding = await screen.findByText('BundleOnboarding')
        expect(bundleOnboarding).toBeInTheDocument()
      })
    })
  })

  describe('no bundle analysis or js/ts present', () => {
    it('renders null', async () => {
      setup({ bundleAnalysisEnabled: false, language: 'python' })
      const { container } = render(<BundlesTab />, {
        wrapper: wrapper(),
      })

      const loader = await screen.findByText('Loading')
      await waitForElementToBeRemoved(loader)

      expect(container).toBeEmptyDOMElement()
    })
  })
})
