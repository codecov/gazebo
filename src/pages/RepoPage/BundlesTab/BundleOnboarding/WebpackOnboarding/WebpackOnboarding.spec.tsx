import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import WebpackOnboarding from './WebpackOnboarding'

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/test-repo/bundles/new/webpack']}>
    <Route path="/:provider/:owner/:repo/bundles/new/webpack">{children}</Route>
  </MemoryRouter>
)

describe('WebpackOnboarding', () => {
  describe('step 1', () => {
    it('renders header', () => {
      render(<WebpackOnboarding />, { wrapper })

      const stepText = screen.getByText('Step 1:')
      expect(stepText).toBeInTheDocument()

      const headerText = screen.getByText('Install the Codecov Webpack Plugin')
      expect(headerText).toBeInTheDocument()
    })

    it('renders body', () => {
      render(<WebpackOnboarding />, { wrapper })

      const bodyText = screen.getByText(/To install the/)
      expect(bodyText).toBeInTheDocument()

      const pluginName = screen.getByText('@codecov/webpack-plugin')
      expect(pluginName).toBeInTheDocument()
    })

    describe('code blocks', () => {
      it('renders npm install', () => {
        render(<WebpackOnboarding />, { wrapper })

        const npmInstallCommand = screen.getByText(
          'npm install @codecov/webpack-plugin --save-dev'
        )
        expect(npmInstallCommand).toBeInTheDocument()
      })

      it('renders yarn install', () => {
        render(<WebpackOnboarding />, { wrapper })

        const yarnInstallCommand = screen.getByText(
          'yarn add @codecov/webpack-plugin --dev'
        )
        expect(yarnInstallCommand).toBeInTheDocument()
      })

      it('renders pnpm install', () => {
        render(<WebpackOnboarding />, { wrapper })

        const pnpmInstallCommand = screen.getByText(
          'pnpm add @codecov/webpack-plugin --save-dev'
        )
        expect(pnpmInstallCommand).toBeInTheDocument()
      })
    })
  })

  describe('step 2', () => {
    it('renders header', () => {
      render(<WebpackOnboarding />, { wrapper })

      const stepText = screen.getByText('Step 2:')
      expect(stepText).toBeInTheDocument()

      const headerText = screen.getByText('Configure the bundler plugin')
      expect(headerText).toBeInTheDocument()
    })

    it('renders body', () => {
      render(<WebpackOnboarding />, { wrapper })

      const bodyText = screen.getByText(
        /Import the bundler plugin, and add it to the end of your plugin array found inside your/
      )
      expect(bodyText).toBeInTheDocument()

      const webpackConfig = screen.getByText('webpack.config.js')
      expect(webpackConfig).toBeInTheDocument()

      const note = screen.getByText('Note:')
      expect(note).toBeInTheDocument()

      const orgSettingsLink = screen.getByRole('link', { name: 'org settings' })
      expect(orgSettingsLink).toBeInTheDocument()
      expect(orgSettingsLink).toHaveAttribute(
        'href',
        '/account/gh/codecov/org-upload-token'
      )
    })

    it('renders plugin config', () => {
      render(<WebpackOnboarding />, { wrapper })

      const pluginText = screen.getByText(/\/\/ webpack.config.js/)
      expect(pluginText).toBeInTheDocument()
    })
  })

  describe('step 3', () => {
    it('renders header', () => {
      render(<WebpackOnboarding />, { wrapper })

      const stepText = screen.getByText('Step 3:')
      expect(stepText).toBeInTheDocument()

      const headerText = screen.getByText('Commit your latest changes')
      expect(headerText).toBeInTheDocument()
    })

    it('renders body', () => {
      render(<WebpackOnboarding />, { wrapper })

      const bodyText = screen.getByText(
        'The plugin requires at least one commit to be made to properly upload bundle analysis information up to Codecov.'
      )
      expect(bodyText).toBeInTheDocument()
    })

    it('renders git commit', () => {
      render(<WebpackOnboarding />, { wrapper })

      const gitCommit = screen.getByText(
        'git add -A && git commit -m "Added Codecov bundler plugin"'
      )
      expect(gitCommit).toBeInTheDocument()
    })
  })

  describe('step 4', () => {
    it('renders header', () => {
      render(<WebpackOnboarding />, { wrapper })

      const stepText = screen.getByText('Step 4:')
      expect(stepText).toBeInTheDocument()

      const headerText = screen.getByText('Build the application')
      expect(headerText).toBeInTheDocument()
    })

    it('renders body', () => {
      render(<WebpackOnboarding />, { wrapper })

      const bodyText = screen.getByText(
        'When building your application the plugin will automatically upload the stats information to Codecov.'
      )
      expect(bodyText).toBeInTheDocument()
    })

    describe('renders code block', () => {
      it('renders npm build', () => {
        render(<WebpackOnboarding />, { wrapper })

        const npmBuild = screen.getByText('npm run build')
        expect(npmBuild).toBeInTheDocument()
      })

      it('renders yarn build', () => {
        render(<WebpackOnboarding />, { wrapper })

        const yarnBuild = screen.getByText('yarn run build')
        expect(yarnBuild).toBeInTheDocument()
      })

      it('renders pnpm build', () => {
        render(<WebpackOnboarding />, { wrapper })

        const pnpmBuild = screen.getByText('pnpm run build')
        expect(pnpmBuild).toBeInTheDocument()
      })
    })
  })

  describe('linking out to setup feedback', () => {
    it('renders correct preview text', () => {
      render(<WebpackOnboarding />, { wrapper })

      const text = screen.getByText(/How was your setup experience\?/)
      expect(text).toBeInTheDocument()

      const letUsKnow = screen.getByText(/Let us know in/)
      expect(letUsKnow).toBeInTheDocument()
    })

    it('renders link', () => {
      render(<WebpackOnboarding />, { wrapper })

      const link = screen.getByText('this issue')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute(
        'href',
        'https://github.com/codecov/feedback/issues/270'
      )
    })
  })
})
