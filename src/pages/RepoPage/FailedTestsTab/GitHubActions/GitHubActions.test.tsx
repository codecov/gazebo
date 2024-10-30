import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PropsWithChildren } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { ThemeContextProvider } from 'shared/ThemeContext'

import GitHubActions from './GitHubActions'

vi.mock('../FrameworkTabsCard', () => ({
  FrameworkTabsCard: () => 'FrameworkTabsCard',
}))
window.matchMedia = vi.fn().mockResolvedValue({ matches: false })

const wrapper: (initialEntries?: string) => React.FC<PropsWithChildren> =
  (initialEntries = '/gh/codecov/cool-repo/tests') =>
  ({ children }) => (
    <ThemeContextProvider>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path={['/:provider/:owner/:repo/tests']}>{children}</Route>
      </MemoryRouter>
    </ThemeContextProvider>
  )

describe('GitHubActions', () => {
  afterAll(() => {
    vi.clearAllMocks()
  })
  function setup() {
    const user = userEvent.setup()
    return { user }
  }

  describe('Step one', () => {
    it('renders framework tabs card', () => {
      render(<GitHubActions />, { wrapper: wrapper() })

      const frameworkTabs = screen.getByText('FrameworkTabsCard')
      expect(frameworkTabs).toBeInTheDocument()
    })
  })

  describe('Step two', () => {
    it('renders title of card', () => {
      render(<GitHubActions />, { wrapper: wrapper() })

      const title = screen.getByText(/Step 2: Add the script/)
      expect(title).toBeInTheDocument()
    })

    it('renders content of card', () => {
      render(<GitHubActions />, { wrapper: wrapper() })

      const content = screen.getByText(
        /In your CI YAML file, add below scripts to the end of your test run./
      )
      expect(content).toBeInTheDocument()
    })

    it('renders script', () => {
      render(<GitHubActions />, { wrapper: wrapper() })

      const script = screen.getByText(/- name: Upload test results to Codecov/)
      expect(script).toBeInTheDocument()
    })

    it('renders expand button', () => {
      render(<GitHubActions />, { wrapper: wrapper() })

      const button = screen.getByRole('button', {
        name: /could look something like this:/,
      })
      expect(button).toBeInTheDocument()
    })

    describe('when expand button is clicked', () => {
      it('should expand content', async () => {
        const { user } = setup()
        render(<GitHubActions />, { wrapper: wrapper() })

        const button = screen.getByRole('button', {
          name: /could look something like this:/,
        })
        expect(button).toBeInTheDocument()

        await user.click(button)

        const content = screen.getByText(/name: Run unit tests/)
        expect(content).toBeInTheDocument()
      })
    })

    describe('when expand button is clicked again', () => {
      it('should collapse content', async () => {
        const { user } = setup()
        render(<GitHubActions />, { wrapper: wrapper() })

        const button = screen.getByRole('button', {
          name: /could look something like this:/,
        })
        expect(button).toBeInTheDocument()

        await user.click(button)
        await user.click(button)

        await waitFor(() => {
          expect(
            screen.queryByText(/name: Run unit tests/)
          ).not.toBeInTheDocument()
        })
      })
    })

    it('renders copy button', () => {
      render(<GitHubActions />, { wrapper: wrapper() })

      const button = screen.getByRole('button', { name: /Copy/ })
      expect(button).toBeInTheDocument()
    })
  })

  describe('Step three', () => {
    it('renders title of card', () => {
      render(<GitHubActions />, { wrapper: wrapper() })

      const title = screen.getByText(/Step 3: Run your test suit/)
      expect(title).toBeInTheDocument()
    })

    it('renders content of card', () => {
      render(<GitHubActions />, { wrapper: wrapper() })

      const content = screen.getByText(
        /You can inspect the workflow logs to see if the call to Codecov succeeded./
      )
      expect(content).toBeInTheDocument()
    })

    it('renders expand button', () => {
      render(<GitHubActions />, { wrapper: wrapper() })

      const button = screen.getByRole('button', {
        name: /Here are examples of failed test reports in PR comments./,
      })
      expect(button).toBeInTheDocument()
    })

    describe('when expand button is clicked', () => {
      const { user } = setup()
      it('should expand content', async () => {
        render(<GitHubActions />, { wrapper: wrapper() })

        const button = screen.getByRole('button', {
          name: /Here are examples of failed test reports in PR comments./,
        })
        expect(button).toBeInTheDocument()

        await user.click(button)

        const content = screen.getByRole('img', { name: /Tests in PR comment/ })
        expect(content).toBeInTheDocument()
      })
    })

    describe('when expand button is clicked again', () => {
      it('should collapse content', async () => {
        const { user } = setup()
        render(<GitHubActions />, { wrapper: wrapper() })

        const button = screen.getByRole('button', {
          name: /Here are examples of failed test reports in PR comments./,
        })
        expect(button).toBeInTheDocument()

        await user.click(button)
        await user.click(button)

        await waitFor(() => {
          expect(
            screen.queryByRole('img', { name: /Tests in PR comment/ })
          ).not.toBeInTheDocument()
        })
      })
    })
  })

  describe('Step four', () => {
    it('renders title of card', () => {
      render(<GitHubActions />, { wrapper: wrapper() })

      const title = screen.getByText(/Step 4: View results and insights/)
      expect(title).toBeInTheDocument()
    })

    it('renders content of card', () => {
      render(<GitHubActions />, { wrapper: wrapper() })

      const content = screen.getByText(
        /After the test run completion, you'll be able to see the failed tests result on the following areas:/
      )
      expect(content).toBeInTheDocument()
    })
  })

  describe('Visit guide', () => {
    it('renders content of card', () => {
      render(<GitHubActions />, { wrapper: wrapper() })

      const content = screen.getByText(/Visit our guide/)
      expect(content).toBeInTheDocument()
    })

    it('renders link', () => {
      render(<GitHubActions />, { wrapper: wrapper() })

      const link = screen.getByRole('link', { name: /learn more/ })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/test-result-ingestion-beta#failed-test-reporting'
      )
    })
  })
})
