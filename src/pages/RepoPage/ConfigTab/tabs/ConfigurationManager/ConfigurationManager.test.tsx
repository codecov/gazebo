import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { Toaster } from 'react-hot-toast'
import { MemoryRouter, Route } from 'react-router'

import ConfigurationManager from './ConfigurationManager'
import { RepositoryConfiguration } from './hooks/useRepoConfigurationStatus/RepoConfigurationStatusQueryOpts'

interface mockRepoConfigArgs {
  isTeamPlan?: boolean
  flags?: boolean
  components?: boolean
  coverage?: boolean
  yaml?: string | null
  bundleAnalysis?: boolean
  testAnalytics?: boolean
  languages?: string[] | null
}

const yamlWithProjectStatus = 'coverage:\n  status:\n    project: true\n'

function mockRepoConfig({
  isTeamPlan = false,
  flags = false,
  components = false,
  coverage = false,
  yaml = null,
  bundleAnalysis = false,
  testAnalytics = false,
  languages = null,
}: mockRepoConfigArgs): RepositoryConfiguration {
  return {
    plan: {
      isTeamPlan,
    },
    repository: {
      __typename: 'Repository',
      coverageEnabled: coverage,
      bundleAnalysisEnabled: bundleAnalysis,
      testAnalyticsEnabled: testAnalytics,
      yaml,
      languages,
      coverageAnalytics: {
        flagsCount: flags ? 1 : 0,
        componentsCount: components ? 1 : 0,
      },
    },
  }
}

const mockCachedBundles = {
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        head: {
          bundleAnalysis: {
            bundleAnalysisReport: {
              __typename: 'BundleAnalysisReport',
              bundles: [
                { name: 'bundle1', cacheConfig: true },
                { name: 'bundle2', cacheConfig: false },
              ],
            },
          },
        },
      },
    },
  },
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()
const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/gh/codecov/cool-repo/config']}>
        <Route path="/:provider/:owner/:repo/config">
          <Suspense fallback={<div>Loading</div>}>{children}</Suspense>
        </Route>
      </MemoryRouter>
      <Toaster />
    </QueryClientProvider>
  </QueryClientProviderV5>
)

beforeAll(() => {
  server.listen()
})
afterEach(() => {
  queryClient.clear()
  queryClientV5.clear()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

interface SetupArgs {
  repoConfig?: RepositoryConfiguration
}

describe('Configuration Manager', () => {
  function setup({ repoConfig = mockRepoConfig({}) }: SetupArgs) {
    const user = userEvent.setup()

    server.use(
      graphql.query('GetRepoConfigurationStatus', () => {
        return HttpResponse.json({ data: { owner: repoConfig } })
      }),
      graphql.query('CachedBundleList', () => {
        return HttpResponse.json({ data: mockCachedBundles })
      })
    )

    return { user }
  }

  describe('CoverageConfiguration', () => {
    it('renders feature block', async () => {
      setup({})
      render(<ConfigurationManager />, { wrapper })

      const heading = await screen.findByRole('heading', { name: 'Coverage' })
      expect(heading).toBeInTheDocument()
    })

    it('renders features', async () => {
      setup({})
      render(<ConfigurationManager />, { wrapper })

      const coverage = await screen.findByText('Coverage reports')
      expect(coverage).toBeInTheDocument()
      const yaml = await screen.findByText('YAML')
      expect(yaml).toBeInTheDocument()
      const projectStatus = await screen.findByText('Project coverage')
      expect(projectStatus).toBeInTheDocument()
      const flags = await screen.findByText('Flags')
      expect(flags).toBeInTheDocument()
      const components = await screen.findByText('Components')
      expect(components).toBeInTheDocument()
    })

    describe('when coverage is not configured', () => {
      it('renders Get Started button', async () => {
        setup({
          repoConfig: mockRepoConfig({
            bundleAnalysis: true,
            testAnalytics: true,
          }),
        })
        render(<ConfigurationManager />, { wrapper })

        const button = await screen.findByTestId('FeatureGroup-get-started')
        expect(button).toBeInTheDocument()
        expect(button).toHaveAttribute('href', '/gh/codecov/cool-repo')
      })

      it('does not render configuration statuses', async () => {
        setup({})
        render(<ConfigurationManager />, { wrapper })

        await waitFor(() =>
          screen.findAllByRole('link', { name: 'Get Started' })
        )

        const configuredStatus = screen.queryByText('Configured')
        expect(configuredStatus).not.toBeInTheDocument()

        const unconfiguredStatus = screen.queryByText('not enabled')
        expect(unconfiguredStatus).not.toBeInTheDocument()
      })
    })

    describe('when only coverage is configured', () => {
      it('renders Configured status', async () => {
        setup({ repoConfig: mockRepoConfig({ coverage: true }) })
        render(<ConfigurationManager />, { wrapper })

        const configuredStatus = await screen.findByText('Configured')
        expect(configuredStatus).toBeInTheDocument()
      })

      it('renders not enabled status for all other features', async () => {
        setup({ repoConfig: mockRepoConfig({ coverage: true }) })
        render(<ConfigurationManager />, { wrapper })

        const notEnabledStatus = await screen.findAllByTestId(
          'FeatureItem-get-started'
        )
        expect(notEnabledStatus).toHaveLength(4)
      })
    })

    describe('when yaml is configured', () => {
      it('renders Configured status', async () => {
        setup({ repoConfig: mockRepoConfig({ coverage: true, yaml: 'yaml' }) })
        render(<ConfigurationManager />, { wrapper })

        const configuredStatus = await screen.findAllByText('Configured')
        expect(configuredStatus).toHaveLength(2)
      })
    })

    describe('when project status checks are configured', () => {
      it('renders Configured status', async () => {
        setup({
          repoConfig: mockRepoConfig({
            coverage: true,
            yaml: yamlWithProjectStatus,
          }),
        })
        render(<ConfigurationManager />, { wrapper })

        const configuredStatus = await screen.findAllByText('Configured')
        expect(configuredStatus).toHaveLength(3)
      })
    })

    describe('when flags are configured', () => {
      it('renders Configured status', async () => {
        setup({ repoConfig: mockRepoConfig({ coverage: true, flags: true }) })
        render(<ConfigurationManager />, { wrapper })

        const configuredStatus = await screen.findAllByText('Configured')
        expect(configuredStatus).toHaveLength(2)
      })
    })

    describe('when components are configured', () => {
      it('renders Configured status', async () => {
        setup({
          repoConfig: mockRepoConfig({ coverage: true, components: true }),
        })
        render(<ConfigurationManager />, { wrapper })

        const configuredStatus = await screen.findAllByText('Configured')
        expect(configuredStatus).toHaveLength(2)
      })
    })

    describe('when not on team plan', () => {
      it('does not render upgrade to pro messaging', async () => {
        setup({ repoConfig: mockRepoConfig({ isTeamPlan: false }) })
        render(<ConfigurationManager />, { wrapper })

        await waitFor(() =>
          screen.findAllByRole('link', { name: 'Get Started' })
        )

        const upgrade = screen.queryByText('Available with Pro Plan')
        expect(upgrade).not.toBeInTheDocument()
      })
    })

    describe('when on team plan', () => {
      it('renders upgrade to pro message', async () => {
        setup({ repoConfig: mockRepoConfig({ isTeamPlan: true }) })
        render(<ConfigurationManager />, { wrapper })

        const upgrade = await screen.findByText('Available with Pro Plan')
        expect(upgrade).toBeInTheDocument()
      })

      it('hides configured status for pro only items', async () => {
        setup({
          repoConfig: mockRepoConfig({
            isTeamPlan: true,
            coverage: true,
            yaml: yamlWithProjectStatus,
            flags: true,
            components: true,
          }),
        })
        render(<ConfigurationManager />, { wrapper })

        const configuredStatus = await screen.findAllByText('Configured')
        expect(configuredStatus).toHaveLength(2)
      })

      it('hides unconfigured status for pro only items', async () => {
        setup({
          repoConfig: mockRepoConfig({ isTeamPlan: true, coverage: true }),
        })
        render(<ConfigurationManager />, { wrapper })

        const unconfiguredStatus = await screen.findAllByTestId(
          'FeatureItem-get-started'
        )
        expect(unconfiguredStatus).toHaveLength(1)
      })
    })
  })

  describe('BundleAnalysisConfiguration', () => {
    describe('when repo does not contain JS or TS', () => {
      it('does not render Bundle analysis feature block', async () => {
        setup({})
        render(<ConfigurationManager />, { wrapper })

        await waitFor(() => screen.findByRole('heading', { name: 'Coverage' }))

        const header = screen.queryByRole('heading', {
          name: 'Bundle analysis',
        })
        expect(header).not.toBeInTheDocument()
      })
    })

    it('renders feature block', async () => {
      setup({
        repoConfig: mockRepoConfig({
          languages: ['javascript'],
        }),
      })
      render(<ConfigurationManager />, { wrapper })

      const heading = await screen.findByRole('heading', {
        name: 'Bundle analysis',
      })
      expect(heading).toBeInTheDocument()
    })

    it('renders features', async () => {
      setup({
        repoConfig: mockRepoConfig({
          languages: ['javascript'],
        }),
      })
      render(<ConfigurationManager />, { wrapper })

      const bundleReports = await screen.findByText('Bundle reports')
      expect(bundleReports).toBeInTheDocument()
    })

    describe('when bundle analysis is not configured', () => {
      it('renders Get Started button', async () => {
        setup({
          repoConfig: mockRepoConfig({
            coverage: true,
            bundleAnalysis: false,
            testAnalytics: true,
            languages: ['typescript'],
          }),
        })
        render(<ConfigurationManager />, { wrapper })

        await waitFor(() =>
          screen.findByRole('heading', { name: 'Bundle analysis' })
        )
        const button = await screen.findByTestId('FeatureGroup-get-started')
        expect(button).toBeInTheDocument()
        expect(button).toHaveAttribute(
          'href',
          '/gh/codecov/cool-repo/bundles/new'
        )
      })

      it('does not render configuration statuses', async () => {
        setup({
          repoConfig: mockRepoConfig({
            coverage: false,
            bundleAnalysis: false,
            testAnalytics: false,
            languages: ['typescript'],
          }),
        })
        render(<ConfigurationManager />, { wrapper })

        await waitFor(() =>
          screen.findAllByRole('link', { name: 'Get Started' })
        )

        const configuredStatus = screen.queryByText('Configured')
        expect(configuredStatus).not.toBeInTheDocument()

        const unconfiguredStatus = screen.queryByText('not enabled')
        expect(unconfiguredStatus).not.toBeInTheDocument()
      })
    })

    describe('when bundle analysis is configured', () => {
      it('renders Configured status', async () => {
        setup({
          repoConfig: mockRepoConfig({
            bundleAnalysis: true,
            languages: ['typescript'],
          }),
        })
        render(<ConfigurationManager />, { wrapper })

        const configuredStatus = await screen.findByText('Configured')
        expect(configuredStatus).toBeInTheDocument()
      })
    })

    describe('bundle caching', () => {
      it('renders bundle caching button', async () => {
        setup({
          repoConfig: mockRepoConfig({
            bundleAnalysis: true,
            languages: ['typescript'],
          }),
        })
        render(<ConfigurationManager />, { wrapper })

        const button = await screen.findByText('Configure data caching')
        expect(button).toBeInTheDocument()
      })

      it('renders bundle caching modal', async () => {
        const { user } = setup({
          repoConfig: mockRepoConfig({
            bundleAnalysis: true,
            languages: ['typescript'],
          }),
        })
        render(<ConfigurationManager />, { wrapper })

        const button = await screen.findByText('Configure data caching')
        expect(button).toBeInTheDocument()

        await user.click(button)

        const modalHeader = await screen.findByText(
          'Configure bundle caching data'
        )
        expect(modalHeader).toBeInTheDocument()
      })
    })
  })

  describe('TestAnalyticsConfiguration', () => {
    it('renders feature block', async () => {
      setup({})
      render(<ConfigurationManager />, { wrapper })

      const heading = await screen.findByRole('heading', {
        name: 'Test analytics',
      })
      expect(heading).toBeInTheDocument()
    })

    it('renders features', async () => {
      setup({})
      render(<ConfigurationManager />, { wrapper })

      const failedTests = await screen.findByText('Failed tests')
      expect(failedTests).toBeInTheDocument()
    })

    describe('when test analytics is not configured', () => {
      it('renders Get Started button', async () => {
        setup({
          repoConfig: mockRepoConfig({
            coverage: true,
            testAnalytics: false,
            bundleAnalysis: true,
          }),
        })
        render(<ConfigurationManager />, { wrapper })

        const button = await screen.findByTestId('FeatureGroup-get-started')
        expect(button).toBeInTheDocument()
        expect(button).toHaveAttribute(
          'href',
          '/gh/codecov/cool-repo/tests/new'
        )
      })

      it('does not render configuration statuses', async () => {
        setup({
          repoConfig: mockRepoConfig({
            coverage: false,
            testAnalytics: false,
            bundleAnalysis: false,
          }),
        })
        render(<ConfigurationManager />, { wrapper })

        await waitFor(() =>
          screen.findAllByRole('link', { name: 'Get Started' })
        )

        const configuredStatus = screen.queryByText('Configured')
        expect(configuredStatus).not.toBeInTheDocument()

        const unconfiguredStatus = screen.queryByText('not enabled')
        expect(unconfiguredStatus).not.toBeInTheDocument()
      })
    })

    describe('when test analytics is configured', () => {
      it('renders Configured status', async () => {
        setup({
          repoConfig: mockRepoConfig({
            coverage: false,
            bundleAnalysis: false,
            testAnalytics: true,
          }),
        })
        render(<ConfigurationManager />, { wrapper })

        const configuredStatus = await screen.findByText('Configured')
        expect(configuredStatus).toBeInTheDocument()
      })
    })
  })

  describe('IntegrationsList', () => {
    it('renders feature block', async () => {
      setup({})
      render(<ConfigurationManager />, { wrapper })

      const heading = await screen.findByRole('heading', {
        name: 'Codecov integrations',
      })
      expect(heading).toBeInTheDocument()
    })

    it('renders features', async () => {
      setup({})
      render(<ConfigurationManager />, { wrapper })

      const vscode = await screen.findByText('VSCode extension')
      expect(vscode).toBeInTheDocument()
      const browserExtension = await screen.findByText('Browser extension')
      expect(browserExtension).toBeInTheDocument()
      const slackApp = await screen.findByText('Slack app')
      expect(slackApp).toBeInTheDocument()
    })
  })
})
