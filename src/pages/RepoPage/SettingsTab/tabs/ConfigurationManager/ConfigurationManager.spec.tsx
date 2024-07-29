import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router'

import { TierNames, TTierNames } from 'services/tier'

import ConfigurationManager from './ConfigurationManager'
import { RepositoryConfiguration } from './hooks/useRepoConfigurationStatus/useRepoConfigurationStatus'

interface mockRepoConfigArgs {
  tierName?: TTierNames
  flags?: boolean
  components?: boolean
  coverage?: boolean
  yaml?: string | null
  bundleAnalysis?: boolean
  testAnalytics?: boolean
}

const yamlWithProjectStatus = 'coverage:\n  status:\n    project: true\n'

function mockRepoConfig({
  tierName = TierNames.PRO,
  flags = false,
  components = false,
  coverage = false,
  yaml = null,
  bundleAnalysis = false,
  testAnalytics = false,
}: mockRepoConfigArgs): RepositoryConfiguration {
  return {
    plan: {
      tierName: tierName,
    },
    repository: {
      __typename: 'Repository',
      flagsCount: flags ? 1 : 0,
      componentsCount: components ? 1 : 0,
      coverageEnabled: coverage,
      bundleAnalysisEnabled: bundleAnalysis,
      testAnalyticsEnabled: testAnalytics,
      yaml,
    },
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})
const server = setupServer()
const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/cool-repo/settings/config']}>
      <Route path="/:provider/:owner/:repo/settings/config">{children}</Route>
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
  repoConfig?: RepositoryConfiguration
}

describe('Configuration Manager', () => {
  function setup({ repoConfig = mockRepoConfig({}) }: SetupArgs) {
    server.use(
      graphql.query('GetRepoConfigurationStatus', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data({ owner: repoConfig }))
      })
    )
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

        const button = await screen.findByRole('link', { name: 'Get Started' })
        expect(button).toBeInTheDocument()
        expect(button).toHaveAttribute('href', '/gh/codecov/cool-repo')
      })

      it('does not render configuration statuses', async () => {
        setup({})
        render(<ConfigurationManager />, { wrapper })

        await waitFor(() => screen.findByRole('link', { name: 'Get Started' }))

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

        const notEnabledStatus = await screen.findAllByText('not enabled')
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
        setup({ repoConfig: mockRepoConfig({ tierName: 'pro' }) })
        render(<ConfigurationManager />, { wrapper })

        await waitFor(() => screen.findByRole('link', { name: 'Get Started' }))

        const upgrade = screen.queryByText('Available with Pro Plan')
        expect(upgrade).not.toBeInTheDocument()
      })
    })

    describe('when on team plan', () => {
      it('renders upgrade to pro message', async () => {
        setup({ repoConfig: mockRepoConfig({ tierName: 'team' }) })
        render(<ConfigurationManager />, { wrapper })

        const upgrade = await screen.findByText('Available with Pro Plan')
        expect(upgrade).toBeInTheDocument()
      })

      it('hides configured status for pro only items', async () => {
        setup({
          repoConfig: mockRepoConfig({
            tierName: 'team',
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
          repoConfig: mockRepoConfig({ tierName: 'team', coverage: true }),
        })
        render(<ConfigurationManager />, { wrapper })

        const unconfiguredStatus = await screen.findAllByText('not enabled')
        expect(unconfiguredStatus).toHaveLength(1)
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
