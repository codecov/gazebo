import { render, screen } from '@testing-library/react'

import FlagsErrorBoundary from './FlagsErrorBoundary'

// silence all verbose console.error
jest.spyOn(console, 'error').mockImplementation()

describe('FlagsErrorBoundary', () => {
  function setup(ToRender) {
    render(
      <FlagsErrorBoundary>
        <ToRender />
      </FlagsErrorBoundary>
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
      expect(screen.queryByText(/hey/)).not.toBeInTheDocument()
    })
  })
})
