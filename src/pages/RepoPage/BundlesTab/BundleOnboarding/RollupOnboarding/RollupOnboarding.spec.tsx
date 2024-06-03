import * as Sentry from '@sentry/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import RollupOnboarding from './RollupOnboarding'

const mockGetRepo = {
  owner: {
    isCurrentUserPartOfOrg: true,
    orgUploadToken: '9e6a6189-20f1-482d-ab62-ecfaa2629290',
    isAdmin: null,
    isCurrentUserActivated: null,
    repository: {
      __typename: 'Repository',
      private: false,
      uploadToken: '9e6a6189-20f1-482d-ab62-ecfaa2629295',
      defaultBranch: 'main',
      yaml: '',
      activated: false,
      oldestCommitAt: '',
      active: true,
      isFirstPullRequest: false,
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

describe('RollupOnboarding', () => {
  function setup(hasOrgUploadToken: boolean | null) {
    // mock out to clear error
    window.prompt = jest.fn()
    const user = userEvent.setup()

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

    return { user }
  }

  describe('rendering onboarding', () => {
    it('sends rollup onboarding metric', async () => {
      setup(null)
      render(<RollupOnboarding />, { wrapper })

      await waitFor(() =>
        expect(Sentry.metrics.increment).toHaveBeenCalledWith(
          'bundles_tab.onboarding.visited_page',
          1,
          { tags: { bundler: 'rollup' } }
        )
      )
    })
  })

  describe('step 1', () => {
    it('renders header', async () => {
      setup(null)
      render(<RollupOnboarding />, { wrapper })

      const stepText = await screen.findByText(/Step 1:/)
      expect(stepText).toBeInTheDocument()

      const headerText = await screen.findByText(
        /Install the Codecov Rollup Plugin/
      )
      expect(headerText).toBeInTheDocument()
    })

    it('renders body', async () => {
      setup(null)
      render(<RollupOnboarding />, { wrapper })

      const bodyText = await screen.findByText(/To install the/)
      expect(bodyText).toBeInTheDocument()

      const pluginName = await screen.findByText('@codecov/rollup-plugin')
      expect(pluginName).toBeInTheDocument()
    })

    describe('code blocks', () => {
      describe('npm', () => {
        it('renders npm install', async () => {
          setup(null)
          render(<RollupOnboarding />, { wrapper })

          const npmInstallCommand = await screen.findByText(
            'npm install @codecov/rollup-plugin --save-dev'
          )
          expect(npmInstallCommand).toBeInTheDocument()
        })

        describe('user clicks copy button', () => {
          it('sends metric to sentry', async () => {
            const { user } = setup(null)
            render(<RollupOnboarding />, { wrapper })

            const npmInstall = await screen.findByTestId('rollup-npm-install')
            const npmInstallCopy = await within(npmInstall).findByTestId(
              'clipboard-code-snippet'
            )

            await user.click(npmInstallCopy)

            await waitFor(() =>
              expect(Sentry.metrics.increment).toHaveBeenCalledWith(
                'bundles_tab.onboarding.copied.install_command',
                1,
                { tags: { package_manager: 'npm', bundler: 'rollup' } }
              )
            )
          })
        })
      })

      describe('yarn', () => {
        it('renders yarn install', async () => {
          setup(null)
          render(<RollupOnboarding />, { wrapper })

          const yarnInstallCommand = await screen.findByText(
            'yarn add @codecov/rollup-plugin --dev'
          )
          expect(yarnInstallCommand).toBeInTheDocument()
        })

        describe('user clicks copy button', () => {
          it('sends metric to sentry', async () => {
            const { user } = setup(null)
            render(<RollupOnboarding />, { wrapper })

            const yarnInstall = await screen.findByTestId('rollup-yarn-install')
            const yarnInstallCopy = await within(yarnInstall).findByTestId(
              'clipboard-code-snippet'
            )

            await user.click(yarnInstallCopy)

            await waitFor(() =>
              expect(Sentry.metrics.increment).toHaveBeenCalledWith(
                'bundles_tab.onboarding.copied.install_command',
                1,
                { tags: { package_manager: 'yarn', bundler: 'rollup' } }
              )
            )
          })
        })
      })

      describe('pnpm', () => {
        it('renders pnpm install', async () => {
          setup(null)
          render(<RollupOnboarding />, { wrapper })

          const pnpmInstallCommand = await screen.findByText(
            'pnpm add @codecov/rollup-plugin --save-dev'
          )
          expect(pnpmInstallCommand).toBeInTheDocument()
        })

        describe('user clicks copy button', () => {
          it('sends metric to sentry', async () => {
            const { user } = setup(null)
            render(<RollupOnboarding />, { wrapper })

            const pnpmInstall = await screen.findByTestId('rollup-pnpm-install')
            const pnpmInstallCopy = await within(pnpmInstall).findByTestId(
              'clipboard-code-snippet'
            )

            await user.click(pnpmInstallCopy)

            await waitFor(() =>
              expect(Sentry.metrics.increment).toHaveBeenCalledWith(
                'bundles_tab.onboarding.copied.install_command',
                1,
                { tags: { package_manager: 'pnpm', bundler: 'rollup' } }
              )
            )
          })
        })
      })
    })
  })

  describe('step 2', () => {
    it('renders header', async () => {
      setup(null)
      render(<RollupOnboarding />, { wrapper })

      const stepText = await screen.findByText(/Step 2:/)
      expect(stepText).toBeInTheDocument()

      const headerText = await screen.findByText(/Copy Codecov token/)
      expect(headerText).toBeInTheDocument()
    })

    it('renders body', async () => {
      setup(null)
      render(<RollupOnboarding />, { wrapper })

      const bodyText = await screen.findByText(
        /Set an environment variable in your build environment with the following upload token./
      )
      expect(bodyText).toBeInTheDocument()
    })

    describe('there is an org token', () => {
      it('renders code block with org token', async () => {
        setup(true)
        render(<RollupOnboarding />, { wrapper })

        const token = await screen.findByText(
          /9e6a6189-20f1-482d-ab62-ecfaa2629290/
        )
        expect(token).toBeInTheDocument()
      })
    })

    describe('there is no org token', () => {
      it('renders code block with repo token', async () => {
        setup(false)
        render(<RollupOnboarding />, { wrapper })

        const token = await screen.findByText(
          /9e6a6189-20f1-482d-ab62-ecfaa2629295/
        )
        expect(token).toBeInTheDocument()
      })
    })

    describe('user clicks copy button', () => {
      it('sends metric to sentry', async () => {
        const { user } = setup(true)
        render(<RollupOnboarding />, { wrapper })

        const uploadToken = await screen.findByTestId('rollup-upload-token')
        const uploadTokenCopy = await within(uploadToken).findByTestId(
          'clipboard-code-snippet'
        )

        await user.click(uploadTokenCopy)

        await waitFor(() =>
          expect(Sentry.metrics.increment).toHaveBeenCalledWith(
            'bundles_tab.onboarding.copied.token',
            1,
            { tags: { bundler: 'rollup' } }
          )
        )
      })
    })
  })

  describe('step 3', () => {
    it('renders header', async () => {
      setup(null)
      render(<RollupOnboarding />, { wrapper })

      const stepText = await screen.findByText(/Step 3:/)
      expect(stepText).toBeInTheDocument()

      const headerText = await screen.findByText(/Configure the bundler plugin/)
      expect(headerText).toBeInTheDocument()
    })

    it('renders body', async () => {
      setup(null)
      render(<RollupOnboarding />, { wrapper })

      const bodyText = await screen.findByText(
        /Import the bundler plugin, and add it to the end of your plugin array found inside your/
      )
      expect(bodyText).toBeInTheDocument()

      const rollupConfig = await screen.findByText('rollup.config.js')
      expect(rollupConfig).toBeInTheDocument()
    })

    it('renders plugin config', async () => {
      setup(null)
      render(<RollupOnboarding />, { wrapper })

      const pluginText = await screen.findByText(/\/\/ rollup.config.js/)
      expect(pluginText).toBeInTheDocument()
    })

    describe('user clicks copy button', () => {
      it('sends metric to sentry', async () => {
        const { user } = setup(true)
        render(<RollupOnboarding />, { wrapper })

        const pluginConfig = await screen.findByTestId('rollup-plugin-config')
        const pluginConfigCopy = await within(pluginConfig).findByTestId(
          'clipboard-code-snippet'
        )

        await user.click(pluginConfigCopy)

        await waitFor(() =>
          expect(Sentry.metrics.increment).toHaveBeenCalledWith(
            'bundles_tab.onboarding.copied.config',
            1,
            { tags: { bundler: 'rollup' } }
          )
        )
      })
    })
  })

  describe('step 4', () => {
    it('renders header', async () => {
      setup(null)
      render(<RollupOnboarding />, { wrapper })

      const stepText = await screen.findByText(/Step 4:/)
      expect(stepText).toBeInTheDocument()

      const headerText = await screen.findByText(
        /Commit and push your latest changes/
      )
      expect(headerText).toBeInTheDocument()
    })

    it('renders body', async () => {
      setup(null)
      render(<RollupOnboarding />, { wrapper })

      const bodyText = await screen.findByText(
        'The plugin requires at least one commit to be made to properly upload bundle analysis information up to Codecov.'
      )
      expect(bodyText).toBeInTheDocument()
    })

    it('renders git commit', async () => {
      setup(null)
      render(<RollupOnboarding />, { wrapper })

      const gitCommit = await screen.findByText(
        'git add -A && git commit -m "Add Codecov bundler plugin" && git push'
      )
      expect(gitCommit).toBeInTheDocument()
    })

    describe('user clicks copy button', () => {
      it('sends metric to sentry', async () => {
        const { user } = setup(true)
        render(<RollupOnboarding />, { wrapper })

        const commitCommand = await screen.findByTestId('rollup-commit-command')
        const commitCommandCopy = await within(commitCommand).findByTestId(
          'clipboard-code-snippet'
        )

        await user.click(commitCommandCopy)

        await waitFor(() =>
          expect(Sentry.metrics.increment).toHaveBeenCalledWith(
            'bundles_tab.onboarding.copied.commit',
            1,
            { tags: { bundler: 'rollup' } }
          )
        )
      })
    })
  })

  describe('step 5', () => {
    it('renders header', async () => {
      setup(null)
      render(<RollupOnboarding />, { wrapper })

      const stepText = await screen.findByText(/Step 5:/)
      expect(stepText).toBeInTheDocument()

      const headerText = await screen.findByText(/Build the application/)
      expect(headerText).toBeInTheDocument()
    })

    it('renders body', async () => {
      setup(null)
      render(<RollupOnboarding />, { wrapper })

      const bodyText = await screen.findByText(
        'When building your application the plugin will automatically upload the stats information to Codecov.'
      )
      expect(bodyText).toBeInTheDocument()
    })

    describe('renders code block', () => {
      describe('npm', () => {
        it('renders npm build', async () => {
          setup(null)
          render(<RollupOnboarding />, { wrapper })

          const npmBuild = await screen.findByText('npm run build')
          expect(npmBuild).toBeInTheDocument()
        })

        describe('user clicks copy button', () => {
          it('sends metric to sentry', async () => {
            const { user } = setup(true)
            render(<RollupOnboarding />, { wrapper })

            const buildCommand = await screen.findByTestId('rollup-npm-build')
            const buildCommandCopy = await within(buildCommand).findByTestId(
              'clipboard-code-snippet'
            )

            await user.click(buildCommandCopy)

            await waitFor(() =>
              expect(Sentry.metrics.increment).toHaveBeenCalledWith(
                'bundles_tab.onboarding.copied.build_command',
                1,
                { tags: { package_manager: 'npm', bundler: 'rollup' } }
              )
            )
          })
        })
      })

      describe('yarn', () => {
        it('renders yarn build', async () => {
          setup(null)
          render(<RollupOnboarding />, { wrapper })

          const yarnBuild = await screen.findByText('yarn run build')
          expect(yarnBuild).toBeInTheDocument()
        })

        describe('user clicks copy button', () => {
          it('sends metric to sentry', async () => {
            const { user } = setup(true)
            render(<RollupOnboarding />, { wrapper })

            const buildCommand = await screen.findByTestId('rollup-yarn-build')
            const buildCommandCopy = await within(buildCommand).findByTestId(
              'clipboard-code-snippet'
            )

            await user.click(buildCommandCopy)

            await waitFor(() =>
              expect(Sentry.metrics.increment).toHaveBeenCalledWith(
                'bundles_tab.onboarding.copied.build_command',
                1,
                { tags: { package_manager: 'yarn', bundler: 'rollup' } }
              )
            )
          })
        })
      })

      describe('pnpm', () => {
        it('renders pnpm build', async () => {
          setup(null)
          render(<RollupOnboarding />, { wrapper })

          const pnpmBuild = await screen.findByText('pnpm run build')
          expect(pnpmBuild).toBeInTheDocument()
        })

        describe('user clicks copy button', () => {
          it('sends metric to sentry', async () => {
            const { user } = setup(true)
            render(<RollupOnboarding />, { wrapper })

            const buildCommand = await screen.findByTestId('rollup-pnpm-build')
            const buildCommandCopy = await within(buildCommand).findByTestId(
              'clipboard-code-snippet'
            )

            await user.click(buildCommandCopy)

            await waitFor(() =>
              expect(Sentry.metrics.increment).toHaveBeenCalledWith(
                'bundles_tab.onboarding.copied.build_command',
                1,
                { tags: { package_manager: 'pnpm', bundler: 'rollup' } }
              )
            )
          })
        })
      })
    })
  })

  describe('linking out to setup feedback', () => {
    it('renders correct preview text', async () => {
      setup(null)
      render(<RollupOnboarding />, { wrapper })

      const text = await screen.findByText(/How was your setup experience\?/)
      expect(text).toBeInTheDocument()

      const letUsKnow = await screen.findByText(/Let us know in/)
      expect(letUsKnow).toBeInTheDocument()
    })

    it('renders link', async () => {
      setup(null)
      render(<RollupOnboarding />, { wrapper })

      const link = await screen.findByText('this issue')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute(
        'href',
        'https://github.com/codecov/feedback/issues/270'
      )
    })
  })
})
