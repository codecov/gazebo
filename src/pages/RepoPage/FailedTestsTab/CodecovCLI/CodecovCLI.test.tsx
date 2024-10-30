import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PropsWithChildren } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { ThemeContextProvider } from 'shared/ThemeContext'

import CodecovCLI from './CodecovCLI'

const wrapper: (initialEntries?: string) => React.FC<PropsWithChildren> =
  (initialEntries = '/gh/codecov/cool-repo/tests/codecov-cli') =>
  ({ children }) => (
    <ThemeContextProvider>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path={['/:provider/:owner/:repo/tests/codecov-cli']}>
          {children}
        </Route>
      </MemoryRouter>
    </ThemeContextProvider>
  )

vi.mock('../FrameworkTabsCard', () => ({
  FrameworkTabsCard: () => 'FrameworkTabsCard',
}))
window.matchMedia = vi.fn().mockResolvedValue({ matches: false })

describe('CodecovCLI', () => {
  afterAll(() => {
    vi.clearAllMocks()
  })

  function setup() {
    const user = userEvent.setup()
    return { user }
  }

  describe('Step one', () => {
    it('renders framework tabs card', () => {
      render(<CodecovCLI />, { wrapper: wrapper() })

      const frameworkTabs = screen.getByText('FrameworkTabsCard')
      expect(frameworkTabs).toBeInTheDocument()
    })
  })

  describe('Step two', () => {
    it('renders title of card', () => {
      render(<CodecovCLI />, { wrapper: wrapper() })

      const title = screen.getByText("Step 2: Install Codecov's CLI in your CI")
      expect(title).toBeInTheDocument()
    })

    it('renders content of card', () => {
      render(<CodecovCLI />, { wrapper: wrapper() })

      const content = screen.getByText(/Here's an example using pip/)
      expect(content).toBeInTheDocument()
    })

    it('renders script', () => {
      render(<CodecovCLI />, { wrapper: wrapper() })

      const script = screen.getByText(/pip install codecov-cli/)
      expect(script).toBeInTheDocument()
    })
  })

  describe('Step three', () => {
    it('renders title of card', () => {
      render(<CodecovCLI />, { wrapper: wrapper() })

      const title = screen.getByText(/Step 3: Upload this file to Codecov/)
      expect(title).toBeInTheDocument()
    })

    it('renders content of card', () => {
      render(<CodecovCLI />, { wrapper: wrapper() })

      const content = screen.getByText(
        /The following snippet instructs the CLI/
      )
      expect(content).toBeInTheDocument()
    })

    it('renders script', () => {
      render(<CodecovCLI />, { wrapper: wrapper() })

      const script = screen.getByText(
        /codecovcli do-upload --report-type test_results/
      )
      expect(script).toBeInTheDocument()
    })
  })

  describe('Step four', () => {
    it('renders title of card', () => {
      render(<CodecovCLI />, { wrapper: wrapper() })

      const title = screen.getByText(/Step 4: Upload coverage to Codecov/)
      expect(title).toBeInTheDocument()
    })

    it('renders content of card', () => {
      render(<CodecovCLI />, { wrapper: wrapper() })

      const content = screen.getByText(/Codecov offers existing wrappers/)
      expect(content).toBeInTheDocument()
    })

    it('renders script', () => {
      render(<CodecovCLI />, { wrapper: wrapper() })

      const script = screen.getByText(/codecovcli upload-process/)
      expect(script).toBeInTheDocument()
    })

    it('renders link', () => {
      render(<CodecovCLI />, { wrapper: wrapper() })

      const link = screen.getByRole('link', { name: /here/ })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/codecov-uploader#using-the-cli-to-upload-reports-with-codecovio-cloud'
      )
    })
  })

  describe('Step five', () => {
    it('renders title of card', () => {
      render(<CodecovCLI />, { wrapper: wrapper() })

      const title = screen.getByText(/Step 5: Run your test suit/)
      expect(title).toBeInTheDocument()
    })

    it('renders content of card', () => {
      render(<CodecovCLI />, { wrapper: wrapper() })

      const content = screen.getByText(/You can inspect the workflow logs/)
      expect(content).toBeInTheDocument()
    })

    it('renders image', () => {
      render(<CodecovCLI />, { wrapper: wrapper() })

      const img = screen.getByAltText('CLI tests')
      expect(img).toBeInTheDocument()
    })

    it('renders expand button', () => {
      render(<CodecovCLI />, { wrapper: wrapper() })

      const button = screen.getByRole('button', {
        name: /Here are examples of failed test reports in PR comments./,
      })
      expect(button).toBeInTheDocument()
    })

    describe('when expand button is clicked', () => {
      it('should expand content', async () => {
        const { user } = setup()
        render(<CodecovCLI />, { wrapper: wrapper() })

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
        render(<CodecovCLI />, { wrapper: wrapper() })

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

  describe('Step six', () => {
    it('renders title of card', () => {
      render(<CodecovCLI />, { wrapper: wrapper() })

      const title = screen.getByText(/Step 6: View results and insights/)
      expect(title).toBeInTheDocument()
    })

    it('renders content of card', () => {
      render(<CodecovCLI />, { wrapper: wrapper() })

      const content = screen.getByText(/After the test run completion/)
      expect(content).toBeInTheDocument()
    })
  })

  describe('Visit guide', () => {
    it('renders content of card', () => {
      render(<CodecovCLI />, { wrapper: wrapper() })

      const content = screen.getByText(/Visit our guide/)
      expect(content).toBeInTheDocument()
    })

    it('renders link', () => {
      render(<CodecovCLI />, { wrapper: wrapper() })

      const link = screen.getByRole('link', { name: /learn more/ })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/test-result-ingestion-beta#failed-test-reporting'
      )
    })
  })
})
