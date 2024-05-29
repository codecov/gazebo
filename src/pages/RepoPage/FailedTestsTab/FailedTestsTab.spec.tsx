import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PropsWithChildren, Suspense } from 'react'
import { MemoryRouter, Route, useLocation } from 'react-router-dom'

import { useRedirect } from 'shared/useRedirect'

import FailedTestsTab from './FailedTestsTab'

jest.mock('shared/useRedirect')
jest.mock('./GitHubActions', () => () => 'GitHub Actions tab')
const mockedUseRedirect = useRedirect as jest.Mock

let testLocation: ReturnType<typeof useLocation>

const wrapper: (initialEntries?: string) => React.FC<PropsWithChildren> =
  (initialEntries = '/gh/codecov/cool-repo/tests') =>
  ({ children }) =>
    (
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route
          path={[
            '/:provider/:owner/:repo/tests',
            '/:provider/:owner/:repo/tests/codecov-cli',
            '/:provider/:owner/:repo/tests/random-path',
          ]}
        >
          <Suspense fallback={null}>{children}</Suspense>
        </Route>
        <Route
          path="*"
          render={({ location }) => {
            testLocation = location
            return null
          }}
        />
      </MemoryRouter>
    )

describe('FailedTestsTab', () => {
  function setup() {
    const user = userEvent.setup()
    const hardRedirect = jest.fn()
    mockedUseRedirect.mockImplementation((data) => ({
      hardRedirect: () => hardRedirect(data),
    }))

    return { hardRedirect, user }
  }

  it('renders intro', () => {
    setup()
    render(<FailedTestsTab />, { wrapper: wrapper() })

    const intro = screen.getByText('Test Analytics')
    expect(intro).toBeInTheDocument()
  })

  it('renders onboarding failed tests img', () => {
    setup()
    render(<FailedTestsTab />, { wrapper: wrapper() })

    const img = screen.getByAltText('failed-tests-onboarding')
    expect(img).toBeInTheDocument()
  })

  describe('Setup Options', () => {
    it('renders', () => {
      setup()
      render(<FailedTestsTab />, { wrapper: wrapper() })

      const selectorHeader = screen.getByText('Select a setup option')
      expect(selectorHeader).toBeInTheDocument()

      const githubActions = screen.getByText('Using GitHub Actions')
      const codecovCLI = screen.getByText("Using Codecov's CLI")
      expect(githubActions).toBeInTheDocument()
      expect(codecovCLI).toBeInTheDocument()
    })

    describe('initial selection', () => {
      describe('when on /tests path', () => {
        it('selects GitHub Actions as default', () => {
          setup()
          render(<FailedTestsTab />, { wrapper: wrapper() })

          const githubActions = screen.getByTestId('github-actions-radio')
          expect(githubActions).toBeInTheDocument()
          expect(githubActions).toHaveAttribute('data-state', 'checked')
        })
      })

      describe('when on /tests/codecov-cli path', () => {
        it('selects Codecov CLI as default', () => {
          setup()
          render(<FailedTestsTab />, {
            wrapper: wrapper('/gl/codecov/cool-repo/tests/codecov-cli'),
          })

          const codecovCLI = screen.getByTestId('codecov-cli-radio')
          expect(codecovCLI).toBeInTheDocument()
          expect(codecovCLI).toHaveAttribute('data-state', 'checked')
        })
      })

      describe('when on random path', () => {
        it('selects GitHub Actions as default', () => {
          setup()
          render(<FailedTestsTab />, {
            wrapper: wrapper('/gl/codecov/cool-repo/tests/random-path'),
          })

          const githubActions = screen.getByTestId('github-actions-radio')
          expect(githubActions).toBeInTheDocument()
          expect(githubActions).toHaveAttribute('data-state', 'checked')
        })
      })
    })

    describe('navigation', () => {
      describe('when GitHub Actions is selected', () => {
        it('should navigate to /tests', async () => {
          const { user } = setup()
          render(<FailedTestsTab />, {
            wrapper: wrapper('/gh/codecov/cool-repo/tests/codecov-cli'),
          })

          const githubActions = screen.getByTestId('github-actions-radio')
          expect(githubActions).toBeInTheDocument()
          expect(githubActions).toHaveAttribute('data-state', 'unchecked')

          await user.click(githubActions)

          expect(githubActions).toBeInTheDocument()
          expect(githubActions).toHaveAttribute('data-state', 'checked')

          expect(testLocation.pathname).toBe('/gh/codecov/cool-repo/tests')
        })
      })

      describe('when Codecov CLI is selected', () => {
        it('should navigate to /codecov-cli', async () => {
          const { user } = setup()
          render(<FailedTestsTab />, { wrapper: wrapper() })

          const codecovCLI = screen.getByTestId('codecov-cli-radio')
          expect(codecovCLI).toBeInTheDocument()
          expect(codecovCLI).toHaveAttribute('data-state', 'unchecked')

          await user.click(codecovCLI)

          expect(codecovCLI).toBeInTheDocument()
          expect(codecovCLI).toHaveAttribute('data-state', 'checked')

          expect(testLocation.pathname).toBe(
            '/gh/codecov/cool-repo/tests/codecov-cli'
          )
        })
      })
    })
  })

  describe('rendering component', () => {
    it('renders github actions', () => {
      setup()
      render(<FailedTestsTab />, { wrapper: wrapper() })
      const content = screen.getByText(/GitHub Actions tab/)
      expect(content).toBeInTheDocument()
    })

    it('renders Codecov CLI', () => {
      setup()
      render(<FailedTestsTab />, {
        wrapper: wrapper('/gh/codecov/cool-repo/tests/codecov-cli'),
      })
      const content = screen.getByText(/Codecov CLI tab/)
      expect(content).toBeInTheDocument()
    })
  })
})
