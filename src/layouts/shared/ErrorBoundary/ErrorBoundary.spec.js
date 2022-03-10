import * as Sentry from '@sentry/browser'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import ErrorBoundary from './ErrorBoundary'

const thrownError = 'Alice in wonderland'
function BadComponent() {
  // eslint-disable-next-line no-throw-literal
  throw thrownError
}

describe('Error Boundary', () => {
  let mockError
  beforeAll(() => jest.disableAutomock())
  afterAll(() => jest.enableAutomock())
  beforeEach(() => {
    mockError = jest.fn()
    const spy = jest.spyOn(console, 'error')
    spy.mockImplementation(mockError)
  })

  function setup(props) {
    render(
      <MemoryRouter initialEntries={['/gh/test/']}>
        <Route path="/:provider/:owner/">
          <ErrorBoundary {...props}>
            <BadComponent />
          </ErrorBoundary>
        </Route>
      </MemoryRouter>
    )
  }

  describe('when a child component throw an error', () => {
    beforeEach(() => {
      setup()
    })

    it('displays it in the console', () => {
      expect(mockError).toHaveBeenCalledTimes(2)
      expect(mockError.mock.calls[0]).toContain(thrownError)
    })

    it('renders the default error UI', () => {
      // @sentry/react seems to have undocumented difference in behavior when not passing fallback.
      // No fallback looks like multiple error message UIs vs a single UI if fallback is set. Not ideal
      setup()
      // Get first error message
      const [defaultErrorUI] = screen.getAllByText(
        /There's been an error. Please try refreshing your browser, if this error persists please/
      )

      expect(defaultErrorUI).toBeInTheDocument()
    })

    it('links to the freshdesk support page', () => {
      const issueLink = screen.getByRole('link', { name: /contact support/i })
      expect(issueLink).toBeInTheDocument()
      expect(issueLink.href).toBe('https://codecov.freshdesk.com/support/home')
    })
  })
  describe('when given a custom error component', () => {
    const customMessage = 'Whoopsie'

    beforeEach(() => {
      setup({ errorComponent: <p>{customMessage}</p> })
    })

    it('displays it in the console', () => {
      expect(mockError).toHaveBeenCalledTimes(2)
      expect(mockError.mock.calls[0]).toContain(thrownError)
    })

    it('renders a custom error component', () => {
      const CustomError = screen.getByText(customMessage)

      expect(CustomError).toBeInTheDocument()
    })
  })
  describe('You can set the scope to sent to Sentry.io', () => {
    // https://docs.sentry.io/platforms/javascript/guides/react/components/errorboundary/#using-multiple-error-boundaries
    const sentryMockScope = jest.fn()

    beforeEach(() => {
      // @sentry/react uses @sentry/browser under the hood to set scope.
      jest.mock('@sentry/browser')
      const spySentry = jest.spyOn(Sentry, 'withScope')
      spySentry.mockImplementation((callback) => {
        callback({ setTag: sentryMockScope })
      })

      setup({
        sentryScopes: [
          ['wonderland', 'alice'],
          ['mad', 'hatter'],
        ],
      })
    })
    afterEach(() => {
      jest.resetAllMocks()
      jest.unmock('@sentry/browser')
    })

    it('The beforeCapture prop correctly sets tags.', () => {
      expect(sentryMockScope).toHaveBeenCalledTimes(2)
      expect(sentryMockScope).toHaveBeenCalledWith('wonderland', 'alice')
      expect(sentryMockScope).toHaveBeenCalledWith('mad', 'hatter')
    })
  })
})
