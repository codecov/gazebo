import { render, screen } from '@testing-library/react'

import NetworkErrorBoundary from './NetworkErrorBoundary'

// silence all verbose console.error
jest.spyOn(console, 'error').mockImplementation()

describe('NetworkErrorBoundary', () => {
  function setup(ToRender) {
    render(
      <NetworkErrorBoundary>
        <ToRender />
      </NetworkErrorBoundary>
    )
  }

  describe('when rendered with children', () => {
    beforeEach(() => {
      function ToRender() {
        return 'hey'
      }
      setup(ToRender)
    })

    it('renders the children', () => {
      expect(screen.getByText(/hey/)).toBeInTheDocument()
    })
  })

  describe('when the children component crashes', () => {
    let error

    beforeEach(() => {
      function ToRender() {
        throw new Error('random')
      }
      try {
        setup(ToRender)
      } catch (e) {
        error = e
      }
    })

    it('propagate the error as its not a network error', () => {
      expect(error.message).toBe('random')
    })
  })

  describe('when the children component has a 401 error', () => {
    beforeEach(() => {
      function ToRender() {
        // eslint-disable-next-line no-throw-literal
        throw {
          status: 401,
          data: {
            detail: 'not authenticated',
          },
        }
      }
      setup(ToRender)
    })

    it('renders a please login', () => {
      expect(screen.getByText(/Please log in/)).toBeInTheDocument()
    })

    it('renders the detail from data', () => {
      expect(screen.getByText(/not authenticated/)).toBeInTheDocument()
    })
  })

  describe('when the children component has a 403 error', () => {
    beforeEach(() => {
      function ToRender() {
        // eslint-disable-next-line no-throw-literal
        throw {
          status: 403,
          data: {
            detail: 'you not admin',
          },
        }
      }
      setup(ToRender)
    })

    it('renders a Unauthorized', () => {
      expect(screen.getByText(/Unauthorized/)).toBeInTheDocument()
    })

    it('renders the detail from data', () => {
      expect(screen.getByText(/you not admin/)).toBeInTheDocument()
    })
  })

  describe('when the children component has a 404 error', () => {
    beforeEach(() => {
      function ToRender() {
        // eslint-disable-next-line no-throw-literal
        throw {
          status: 404,
        }
      }
      setup(ToRender)
    })

    it('renders a Not found', () => {
      expect(screen.getByText(/Not found/)).toBeInTheDocument()
    })
  })

  describe('when the children component has a 500 error', () => {
    beforeEach(() => {
      function ToRender() {
        // eslint-disable-next-line no-throw-literal
        throw {
          status: 500,
        }
      }
      setup(ToRender)
    })

    it('renders a Server error', () => {
      expect(screen.getByText(/Server error/)).toBeInTheDocument()
    })
  })

  describe('when the children component has an UnauthenticatedError GraphQL error', () => {
    beforeEach(() => {
      function ToRender() {
        // eslint-disable-next-line no-throw-literal
        throw {
          __typename: 'UnauthenticatedError',
        }
      }
      setup(ToRender)
    })

    it('renders a Not found', () => {
      expect(screen.getByText(/Please log in/)).toBeInTheDocument()
    })
  })
})
