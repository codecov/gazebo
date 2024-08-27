import * as Sentry from '@sentry/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import RemixOnboarding from './RemixOnboarding'

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

describe('RemixOnboarding', () => {
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
    it('sends remix onboarding metric', async () => {
      setup(null)
      render(<RemixOnboarding />, { wrapper })

      await waitFor(() =>
        expect(Sentry.metrics.increment).toHaveBeenCalledWith(
          'bundles_tab.onboarding.visited_page',
          1,
          { tags: { bundler: 'remix' } }
        )
      )
    })
  })

  describe('step 1', () => {
    it('renders header', async () => {
      setup(null)
      render(<RemixOnboarding />, { wrapper })

      const stepText = await screen.findByText(/Step 1:/)
      expect(stepText).toBeInTheDocument()

      const headerText = await screen.findByText(
        /Install the Codecov Remix Vite Plugin/
      )
      expect(headerText).toBeInTheDocument()
    })

    it('renders body', async () => {
      setup(null)
      render(<RemixOnboarding />, { wrapper })

      const bodyText = await screen.findByText(/To install the/)
      expect(bodyText).toBeInTheDocument()

      const pluginName = await screen.findByText('@codecov/remix-vite-plugin')
      expect(pluginName).toBeInTheDocument()
    })

    describe('code blocks', () => {
      describe('npm', () => {
        it('renders npm install', async () => {
          setup(null)
          render(<RemixOnboarding />, { wrapper })

          const npmInstallCommand = await screen.findByText(
            'npm install @codecov/remix-vite-plugin --save-dev'
          )
          expect(npmInstallCommand).toBeInTheDocument()
        })

        describe('user clicks copy button', () => {
          it('sends metric to sentry', async () => {
            const { user } = setup(null)
            render(<RemixOnboarding />, { wrapper })

            const npmInstall = await screen.findByTestId('remix-npm-install')
            const npmInstallCopy = await within(npmInstall).findByTestId(
              'clipboard-code-snippet'
            )

            await user.click(npmInstallCopy)

            await waitFor(() =>
              expect(Sentry.metrics.increment).toHaveBeenCalledWith(
                'bundles_tab.onboarding.copied.install_command',
                1,
                { tags: { package_manager: 'npm', bundler: 'remix' } }
              )
            )
          })
        })
      })

      describe('yarn', () => {
        it('renders yarn install', async () => {
          setup(null)
          render(<RemixOnboarding />, { wrapper })

          const yarnInstallCommand = await screen.findByText(
            'yarn add @codecov/remix-vite-plugin --dev'
          )
          expect(yarnInstallCommand).toBeInTheDocument()
        })

        describe('user clicks copy button', () => {
          it('sends metric to sentry', async () => {
            const { user } = setup(null)
            render(<RemixOnboarding />, { wrapper })

            const yarnInstall = await screen.findByTestId('remix-yarn-install')
            const yarnInstallCopy = await within(yarnInstall).findByTestId(
              'clipboard-code-snippet'
            )

            await user.click(yarnInstallCopy)

            await waitFor(() =>
              expect(Sentry.metrics.increment).toHaveBeenCalledWith(
                'bundles_tab.onboarding.copied.install_command',
                1,
                { tags: { package_manager: 'yarn', bundler: 'remix' } }
              )
            )
          })
        })
      })

      describe('pnpm', () => {
        it('renders pnpm install', async () => {
          setup(null)
          render(<RemixOnboarding />, { wrapper })

          const pnpmInstallCommand = await screen.findByText(
            'pnpm add @codecov/remix-vite-plugin --save-dev'
          )
          expect(pnpmInstallCommand).toBeInTheDocument()
        })

        describe('user clicks copy button', () => {
          it('sends metric to sentry', async () => {
            const { user } = setup(null)
            render(<RemixOnboarding />, { wrapper })

            const pnpmInstall = await screen.findByTestId('remix-pnpm-install')
            const pnpmInstallCopy = await within(pnpmInstall).findByTestId(
              'clipboard-code-snippet'
            )

            await user.click(pnpmInstallCopy)

            await waitFor(() =>
              expect(Sentry.metrics.increment).toHaveBeenCalledWith(
                'bundles_tab.onboarding.copied.install_command',
                1,
                { tags: { package_manager: 'pnpm', bundler: 'remix' } }
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
      render(<RemixOnboarding />, { wrapper })

      const stepText = await screen.findByText(/Step 2:/)
      expect(stepText).toBeInTheDocument()

      const headerText = await screen.findByText(/Copy Codecov token/)
      expect(headerText).toBeInTheDocument()
    })

    it('renders body', async () => {
      setup(null)
      render(<RemixOnboarding />, { wrapper })

      const bodyText = await screen.findByText(
        /Set an environment variable in your build environment with the following upload token./
      )
      expect(bodyText).toBeInTheDocument()
    })

    describe('there is an org token', () => {
      it('renders code block with org token', async () => {
        setup(true)
        render(<RemixOnboarding />, { wrapper })

        const token = await screen.findByText(
          /9e6a6189-20f1-482d-ab62-ecfaa2629290/
        )
        expect(token).toBeInTheDocument()
      })
    })

    describe('there is no org token', () => {
      it('renders code block with repo token', async () => {
        setup(false)
        render(<RemixOnboarding />, { wrapper })

        const token = await screen.findByText(
          /9e6a6189-20f1-482d-ab62-ecfaa2629295/
        )
        expect(token).toBeInTheDocument()
      })
    })

    describe('user clicks copy button', () => {
      it('sends metric to sentry', async () => {
        const { user } = setup(true)
        render(<RemixOnboarding />, { wrapper })

        const uploadToken = await screen.findByTestId('remix-upload-token')
        const uploadTokenCopy = await within(uploadToken).findByTestId(
          'clipboard-code-snippet'
        )

        await user.click(uploadTokenCopy)

        await waitFor(() =>
          expect(Sentry.metrics.increment).toHaveBeenCalledWith(
            'bundles_tab.onboarding.copied.token',
            1,
            { tags: { bundler: 'remix' } }
          )
        )
      })
    })
  })

  describe('step 3', () => {
    it('renders header', async () => {
      setup(null)
      render(<RemixOnboarding />, { wrapper })

      const stepText = await screen.findByText(/Step 3:/)
      expect(stepText).toBeInTheDocument()

      const headerText = await screen.findByText(/Configure the bundler plugin/)
      expect(headerText).toBeInTheDocument()
    })

    it('renders body', async () => {
      setup(null)
      render(<RemixOnboarding />, { wrapper })

      const bodyText = await screen.findByText(
        /Add the plugin to the end of your modules array found inside your/
      )
      expect(bodyText).toBeInTheDocument()

      const remixConfig = await screen.findByText('vite.config.ts')
      expect(remixConfig).toBeInTheDocument()
    })

    it('renders plugin config', async () => {
      setup(null)
      render(<RemixOnboarding />, { wrapper })

      const pluginText = await screen.findByText(/\/\/ vite.config.ts/)
      expect(pluginText).toBeInTheDocument()
    })

    describe('user clicks copy button', () => {
      it('sends metric to sentry', async () => {
        const { user } = setup(true)
        render(<RemixOnboarding />, { wrapper })

        const pluginConfig = await screen.findByTestId('remix-plugin-config')
        const pluginConfigCopy = await within(pluginConfig).findByTestId(
          'clipboard-code-snippet'
        )

        await user.click(pluginConfigCopy)

        await waitFor(() =>
          expect(Sentry.metrics.increment).toHaveBeenCalledWith(
            'bundles_tab.onboarding.copied.config',
            1,
            { tags: { bundler: 'remix' } }
          )
        )
      })
    })
  })

  describe('step 4', () => {
    it('renders header', async () => {
      setup(null)
      render(<RemixOnboarding />, { wrapper })

      const stepText = await screen.findByText(/Step 4:/)
      expect(stepText).toBeInTheDocument()

      const headerText = await screen.findByText(
        /Commit and push your latest changes/
      )
      expect(headerText).toBeInTheDocument()
    })

    it('renders body', async () => {
      setup(null)
      render(<RemixOnboarding />, { wrapper })

      const bodyText = await screen.findByText(
        'The plugin requires at least one commit to be made to properly upload bundle analysis information to Codecov.'
      )
      expect(bodyText).toBeInTheDocument()
    })

    it('renders git commit', async () => {
      setup(null)
      render(<RemixOnboarding />, { wrapper })

      const gitCommit = await screen.findByText(
        'git add -A && git commit -m "Add Codecov bundler plugin" && git push'
      )
      expect(gitCommit).toBeInTheDocument()
    })

    describe('user clicks copy button', () => {
      it('sends metric to sentry', async () => {
        const { user } = setup(true)
        render(<RemixOnboarding />, { wrapper })

        const commitCommand = await screen.findByTestId('remix-commit-command')
        const commitCommandCopy = await within(commitCommand).findByTestId(
          'clipboard-code-snippet'
        )

        await user.click(commitCommandCopy)

        await waitFor(() =>
          expect(Sentry.metrics.increment).toHaveBeenCalledWith(
            'bundles_tab.onboarding.copied.commit',
            1,
            { tags: { bundler: 'remix' } }
          )
        )
      })
    })
  })

  describe('step 5', () => {
    it('renders header', async () => {
      setup(null)
      render(<RemixOnboarding />, { wrapper })

      const stepText = await screen.findByText(/Step 5:/)
      expect(stepText).toBeInTheDocument()

      const headerText = await screen.findByText(/Build the application/)
      expect(headerText).toBeInTheDocument()
    })

    it('renders body', async () => {
      setup(null)
      render(<RemixOnboarding />, { wrapper })

      const bodyText = await screen.findByText(
        'When building your application the plugin will automatically upload the stats information to Codecov.'
      )
      expect(bodyText).toBeInTheDocument()
    })

    describe('renders code block', () => {
      describe('npm', () => {
        it('renders npm build', async () => {
          setup(null)
          render(<RemixOnboarding />, { wrapper })

          const npmBuild = await screen.findByText('npm run build')
          expect(npmBuild).toBeInTheDocument()
        })

        describe('user clicks copy button', () => {
          it('sends metric to sentry', async () => {
            const { user } = setup(true)
            render(<RemixOnboarding />, { wrapper })

            const buildCommand = await screen.findByTestId('remix-npm-build')
            const buildCommandCopy = await within(buildCommand).findByTestId(
              'clipboard-code-snippet'
            )

            await user.click(buildCommandCopy)

            await waitFor(() =>
              expect(Sentry.metrics.increment).toHaveBeenCalledWith(
                'bundles_tab.onboarding.copied.build_command',
                1,
                { tags: { package_manager: 'npm', bundler: 'remix' } }
              )
            )
          })
        })
      })

      describe('yarn', () => {
        it('renders yarn build', async () => {
          setup(null)
          render(<RemixOnboarding />, { wrapper })

          const yarnBuild = await screen.findByText('yarn run build')
          expect(yarnBuild).toBeInTheDocument()
        })

        describe('user clicks copy button', () => {
          it('sends metric to sentry', async () => {
            const { user } = setup(true)
            render(<RemixOnboarding />, { wrapper })

            const buildCommand = await screen.findByTestId('remix-yarn-build')
            const buildCommandCopy = await within(buildCommand).findByTestId(
              'clipboard-code-snippet'
            )

            await user.click(buildCommandCopy)

            await waitFor(() =>
              expect(Sentry.metrics.increment).toHaveBeenCalledWith(
                'bundles_tab.onboarding.copied.build_command',
                1,
                { tags: { package_manager: 'yarn', bundler: 'remix' } }
              )
            )
          })
        })
      })

      describe('pnpm', () => {
        it('renders pnpm build', async () => {
          setup(null)
          render(<RemixOnboarding />, { wrapper })

          const pnpmBuild = await screen.findByText('pnpm run build')
          expect(pnpmBuild).toBeInTheDocument()
        })

        describe('user clicks copy button', () => {
          it('sends metric to sentry', async () => {
            const { user } = setup(true)
            render(<RemixOnboarding />, { wrapper })

            const buildCommand = await screen.findByTestId('remix-pnpm-build')
            const buildCommandCopy = await within(buildCommand).findByTestId(
              'clipboard-code-snippet'
            )

            await user.click(buildCommandCopy)

            await waitFor(() =>
              expect(Sentry.metrics.increment).toHaveBeenCalledWith(
                'bundles_tab.onboarding.copied.build_command',
                1,
                { tags: { package_manager: 'pnpm', bundler: 'remix' } }
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
      render(<RemixOnboarding />, { wrapper })

      const text = await screen.findByText(/How was your setup experience\?/)
      expect(text).toBeInTheDocument()

      const letUsKnow = await screen.findByText(/Let us know in/)
      expect(letUsKnow).toBeInTheDocument()
    })

    it('renders link', async () => {
      setup(null)
      render(<RemixOnboarding />, { wrapper })

      const link = await screen.findByText('this issue')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute(
        'href',
        'https://github.com/codecov/feedback/issues/270'
      )
    })
  })

  describe('learn more blurb', () => {
    it('renders body', async () => {
      setup(null)
      render(<RemixOnboarding />, { wrapper })

      const body = await screen.findByText(/Visit our guide to/)
      expect(body).toBeInTheDocument()

      const link = await screen.findByRole('link', { name: /learn more/ })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/javascript-bundle-analysis'
      )
    })
  })
})
