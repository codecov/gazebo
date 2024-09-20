import * as Sentry from '@sentry/browser'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'
import { vi } from 'vitest'

import ErrorBoundary from './ErrorBoundary'

const thrownError = 'Alice in wonderland'
function BadComponent() {
  throw new Error(thrownError)
}

// https://docs.sentry.io/platforms/javascript/guides/react/components/errorboundary/#using-multiple-error-boundaries
const sentryMockScope = vi.fn()

describe('Error Boundary', () => {
  let mockError

  beforeEach(() => {
    mockError = vi.fn()
    const spy = vi.spyOn(console, 'error')
    spy.mockImplementation(mockError)
  })

  describe('when a child component throw an error', () => {
    it('displays it in the console', () => {
      render(
        <MemoryRouter initialEntries={['/gh/test/']}>
          <Route path="/:provider/:owner/">
            <ErrorBoundary>
              <BadComponent />
            </ErrorBoundary>
          </Route>
        </MemoryRouter>
      )

      expect(mockError).toHaveBeenCalled()
      expect(mockError.mock.calls[0][0]).toContain(thrownError) // Can this be done better?
    })

    it('renders the default error UI', () => {
      // @sentry/react seems to have undocumented difference in behavior when not passing fallback.
      // No fallback looks like multiple error message UIs vs a single UI if fallback is set. Not ideal
      render(
        <MemoryRouter initialEntries={['/gh/test/']}>
          <Route path="/:provider/:owner/">
            <ErrorBoundary>
              <BadComponent />
            </ErrorBoundary>
          </Route>
        </MemoryRouter>
      )

      // Get first error message
      const [defaultErrorUI] = screen.getAllByText(
        /There's been an error. Please try refreshing your browser, if this error persists please/
      )

      expect(defaultErrorUI).toBeInTheDocument()
    })

    it('links to the freshdesk support page', () => {
      render(
        <MemoryRouter initialEntries={['/gh/test/']}>
          <Route path="/:provider/:owner/">
            <ErrorBoundary>
              <BadComponent />
            </ErrorBoundary>
          </Route>
        </MemoryRouter>
      )

      const issueLink = screen.getByRole('link', { name: /contact support/i })
      expect(issueLink).toBeInTheDocument()
      expect(issueLink.href).toBe('https://codecovpro.zendesk.com/hc/en-us')
    })
  })
  describe('when given a custom error component', () => {
    const customMessage = 'Whoopsie'

    it('displays it in the console', () => {
      render(
        <MemoryRouter initialEntries={['/gh/test/']}>
          <Route path="/:provider/:owner/">
            <ErrorBoundary errorComponent={<p>{customMessage}</p>}>
              <BadComponent />
            </ErrorBoundary>
          </Route>
        </MemoryRouter>
      )

      expect(mockError).toHaveBeenCalled()
      expect(mockError.mock.calls[0][0]).toContain(thrownError)
    })

    it('renders a custom error component', () => {
      render(
        <MemoryRouter initialEntries={['/gh/test/']}>
          <Route path="/:provider/:owner/">
            <ErrorBoundary errorComponent={<p>{customMessage}</p>}>
              <BadComponent />
            </ErrorBoundary>
          </Route>
        </MemoryRouter>
      )

      const CustomError = screen.getByText(customMessage)

      expect(CustomError).toBeInTheDocument()
    })
  })

  describe.skip('You can set the scope to sent to Sentry.io', () => {
    beforeEach(() => {
      const spySentry = jest.spyOn(Sentry, 'withScope')
      spySentry.mockImplementation((callback) => {
        callback({ setTag: sentryMockScope })
      })
    })

    afterEach(() => {
      jest.resetAllMocks()
      jest.unmock('@sentry/browser')
    })

    it('The beforeCapture prop correctly sets tags.', () => {
      render(
        <MemoryRouter initialEntries={['/gh/test/']}>
          <Route path="/:provider/:owner/">
            <ErrorBoundary
              sentryScopes={[
                ['wonderland', 'alice'],
                ['mad', 'hatter'],
              ]}
            >
              <BadComponent />
            </ErrorBoundary>
          </Route>
        </MemoryRouter>
      )

      expect(sentryMockScope).toHaveBeenCalledTimes(2)
      expect(sentryMockScope).toHaveBeenCalledWith('wonderland', 'alice')
      expect(sentryMockScope).toHaveBeenCalledWith('mad', 'hatter')
    })
  })
})
