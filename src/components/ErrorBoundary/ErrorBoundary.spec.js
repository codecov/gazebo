import { render, screen } from '@testing-library/react'
import ErrorBoundary from './ErrorBoundary'
import * as Sentry from '@sentry/browser'

function BadComponent() {
  // eslint-disable-next-line no-throw-literal
  throw 'Alice in wonderland'
}

const mockError = jest.fn()
const spy = jest.spyOn(console, 'error')

describe('Error Boundary', () => {
  beforeAll(() => jest.disableAutomock())
  afterAll(() => jest.enableAutomock())
  beforeEach(() => {
    spy.mockImplementation(mockError)
  })
  afterEach(() => {
    jest.resetAllMocks()
  })

  function setup({ errorComponent, scopeFn } = {}) {
    render(
      <ErrorBoundary errorComponent={errorComponent} scopeFn={scopeFn}>
        <BadComponent />
      </ErrorBoundary>
    )
  }

  describe('Catches a js error', () => {
    beforeEach(() => {
      setup()
    })
    afterEach(() => mockError.mockRestore())

    it('console.error is thrown', () => {
      expect(spy).toHaveBeenCalled()
      expect(mockError.mock.calls.length).toBe(2)
      expect(mockError.mock.calls[0]).toContain('Alice in wonderland')
    })
  })
  describe('Provides UI feedback that an error has occured.', () => {
    afterEach(() => mockError.mockRestore())

    it('renders the default error UI', () => {
      setup()
      const defaultErrorUI = screen.getByText(
        /Well this is embarassing, looks like we had an error./
      )

      expect(defaultErrorUI).toBeInTheDocument()
    })
    it('renders a custom error component', () => {
      const ec = () => <p>Whoopsie</p>
      setup({ errorComponent: ec })
      const CustomError = screen.getByText(/Whoopsie/)

      expect(CustomError).toBeInTheDocument()
    })
  })
  describe('You can set the scope to sent to Sentry.io', () => {
    // https://docs.sentry.io/platforms/javascript/guides/react/components/errorboundary/#using-multiple-error-boundaries
    let spySentry
    const sentryMockScope = { setTag: jest.fn() }

    beforeEach(() => {
      // @sentry/react uses @sentry/browser under the hood to set scope.
      jest.mock('@sentry/browser')
      spySentry = jest.spyOn(Sentry, 'withScope')
      spySentry.mockImplementation((callback) => {
        callback(sentryMockScope)
      })

      setup({ scopeFn: (scope) => scope.setTag('wonderland', 'alice') })
    })
    afterEach(() => {
      jest.resetAllMocks()
      jest.unmock('@sentry/browser')
    })

    it('The scopeFn prop correctly sets tags.', () => {
      expect(spySentry).toHaveBeenCalled()
      expect(sentryMockScope.setTag.mock.calls.length).toBe(1)
      expect(sentryMockScope.setTag.mock.calls[0]).toContain('wonderland')
      expect(sentryMockScope.setTag.mock.calls[0]).toContain('alice')
    })
  })
})
