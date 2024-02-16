import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import WebpackOnboarding from './WebpackOnboarding'

const mockGetRepo = {
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      private: false,
      uploadToken: '9e6a6189-20f1-482d-ab62-ecfaa2629295',
      defaultBranch: 'main',
      yaml: '',
      activated: false,
      oldestCommitAt: '',
    },
  },
}

const mockGetOrgUploadToken = (hasOrgUploadToken: boolean | null) => ({
  owner: {
    orgUploadToken: hasOrgUploadToken
      ? '9e6a6189-20f1-482d-ab62-ecfaa2629290'
      : null,
  },
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      retry: false,
    },
  },
})
const server = setupServer()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/test-repo/bundles/new']}>
      <Route path="/:provider/:owner/:repo/bundles/new">{children}</Route>
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

describe('WebpackOnboarding', () => {
  function setup(hasOrgUploadToken: boolean | null) {
    server.use(
      graphql.query('GetRepo', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockGetRepo))
      ),
      graphql.query('GetOrgUploadToken', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data(mockGetOrgUploadToken(hasOrgUploadToken))
        )
      })
    )
  }

  describe('step 1', () => {
    it('renders header', async () => {
      setup(null)
      render(<WebpackOnboarding />, { wrapper })

      const stepText = await screen.findByText('Step 1:')
      expect(stepText).toBeInTheDocument()

      const headerText = await screen.findByText(
        'Install the Codecov Webpack Plugin'
      )
      expect(headerText).toBeInTheDocument()
    })

    it('renders body', async () => {
      setup(null)
      render(<WebpackOnboarding />, { wrapper })

      const bodyText = await screen.findByText(/To install the/)
      expect(bodyText).toBeInTheDocument()

      const pluginName = await screen.findByText('@codecov/webpack-plugin')
      expect(pluginName).toBeInTheDocument()
    })

    describe('code blocks', () => {
      it('renders npm install', async () => {
        setup(null)
        render(<WebpackOnboarding />, { wrapper })

        const npmInstallCommand = await screen.findByText(
          'npm install @codecov/webpack-plugin --save-dev'
        )
        expect(npmInstallCommand).toBeInTheDocument()
      })

      it('renders yarn install', async () => {
        setup(null)
        render(<WebpackOnboarding />, { wrapper })

        const yarnInstallCommand = await screen.findByText(
          'yarn add @codecov/webpack-plugin --dev'
        )
        expect(yarnInstallCommand).toBeInTheDocument()
      })

      it('renders pnpm install', async () => {
        setup(null)
        render(<WebpackOnboarding />, { wrapper })

        const pnpmInstallCommand = await screen.findByText(
          'pnpm add @codecov/webpack-plugin --save-dev'
        )
        expect(pnpmInstallCommand).toBeInTheDocument()
      })
    })
  })

  describe('step 2', () => {
    it('renders header', async () => {
      setup(null)
      render(<WebpackOnboarding />, { wrapper })

      const stepText = await screen.findByText('Step 2:')
      expect(stepText).toBeInTheDocument()

      const headerText = await screen.findByText('Copy Codecov token')
      expect(headerText).toBeInTheDocument()
    })

    it('renders body', async () => {
      setup(null)
      render(<WebpackOnboarding />, { wrapper })

      const bodyText = await screen.findByText(
        /Set an environment variable in your build environment with the following upload token./
      )
      expect(bodyText).toBeInTheDocument()
    })

    describe('there is an org token', () => {
      it('renders code block with org token', async () => {
        setup(true)
        render(<WebpackOnboarding />, { wrapper })

        const token = await screen.findByText(
          /9e6a6189-20f1-482d-ab62-ecfaa2629290/
        )
        expect(token).toBeInTheDocument()
      })
    })

    describe('there is no org token', () => {
      it('renders code block with repo token', async () => {
        setup(false)
        render(<WebpackOnboarding />, { wrapper })

        const token = await screen.findByText(
          /9e6a6189-20f1-482d-ab62-ecfaa2629295/
        )
        expect(token).toBeInTheDocument()
      })
    })
  })

  describe('step 3', () => {
    it('renders header', async () => {
      setup(null)
      render(<WebpackOnboarding />, { wrapper })

      const stepText = await screen.findByText('Step 3:')
      expect(stepText).toBeInTheDocument()

      const headerText = await screen.findByText('Configure the bundler plugin')
      expect(headerText).toBeInTheDocument()
    })

    it('renders body', async () => {
      setup(null)
      render(<WebpackOnboarding />, { wrapper })

      const bodyText = await screen.findByText(
        /Import the bundler plugin, and add it to the end of your plugin array found inside your/
      )
      expect(bodyText).toBeInTheDocument()

      const webpackConfig = await screen.findByText('webpack.config.js')
      expect(webpackConfig).toBeInTheDocument()
    })

    it('renders plugin config', async () => {
      setup(null)
      render(<WebpackOnboarding />, { wrapper })

      const pluginText = await screen.findByText(/\/\/ webpack.config.js/)
      expect(pluginText).toBeInTheDocument()
    })
  })

  describe('step 4', () => {
    it('renders header', async () => {
      setup(null)
      render(<WebpackOnboarding />, { wrapper })

      const stepText = await screen.findByText('Step 4:')
      expect(stepText).toBeInTheDocument()

      const headerText = await screen.findByText('Commit your latest changes')
      expect(headerText).toBeInTheDocument()
    })

    it('renders body', async () => {
      setup(null)
      render(<WebpackOnboarding />, { wrapper })

      const bodyText = await screen.findByText(
        'The plugin requires at least one commit to be made to properly upload bundle analysis information up to Codecov.'
      )
      expect(bodyText).toBeInTheDocument()
    })

    it('renders git commit', async () => {
      setup(null)
      render(<WebpackOnboarding />, { wrapper })

      const gitCommit = await screen.findByText(
        'git add -A && git commit -m "Added Codecov bundler plugin"'
      )
      expect(gitCommit).toBeInTheDocument()
    })
  })

  describe('step 5', () => {
    it('renders header', async () => {
      setup(null)
      render(<WebpackOnboarding />, { wrapper })

      const stepText = await screen.findByText('Step 5:')
      expect(stepText).toBeInTheDocument()

      const headerText = await screen.findByText('Build the application')
      expect(headerText).toBeInTheDocument()
    })

    it('renders body', async () => {
      setup(null)
      render(<WebpackOnboarding />, { wrapper })

      const bodyText = await screen.findByText(
        'When building your application the plugin will automatically upload the stats information to Codecov.'
      )
      expect(bodyText).toBeInTheDocument()
    })

    describe('renders code block', () => {
      it('renders npm build', async () => {
        setup(null)
        render(<WebpackOnboarding />, { wrapper })

        const npmBuild = await screen.findByText('npm run build')
        expect(npmBuild).toBeInTheDocument()
      })

      it('renders yarn build', async () => {
        setup(null)
        render(<WebpackOnboarding />, { wrapper })

        const yarnBuild = await screen.findByText('yarn run build')
        expect(yarnBuild).toBeInTheDocument()
      })

      it('renders pnpm build', async () => {
        setup(null)
        render(<WebpackOnboarding />, { wrapper })

        const pnpmBuild = await screen.findByText('pnpm run build')
        expect(pnpmBuild).toBeInTheDocument()
      })
    })
  })

  describe('linking out to setup feedback', () => {
    it('renders correct preview text', async () => {
      setup(null)
      render(<WebpackOnboarding />, { wrapper })

      const text = await screen.findByText(/How was your setup experience\?/)
      expect(text).toBeInTheDocument()

      const letUsKnow = await screen.findByText(/Let us know in/)
      expect(letUsKnow).toBeInTheDocument()
    })

    it('renders link', async () => {
      setup(null)
      render(<WebpackOnboarding />, { wrapper })

      const link = await screen.findByText('this issue')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute(
        'href',
        'https://github.com/codecov/feedback/issues/270'
      )
    })
  })
})
