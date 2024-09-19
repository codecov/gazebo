import { cleanup, render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import SilentNetworkError from './SilentNetworkError'

// silence all verbose console.error
vi.spyOn(console, 'error').mockImplementation(() => undefined)

afterEach(() => {
  cleanup()
})

describe('SilentNetworkError', () => {
  function setup(ComponentToRender, props = {}) {
    render(
      <SilentNetworkError {...props}>{ComponentToRender}</SilentNetworkError>
    )
  }

  describe('when rendered with children', () => {
    beforeEach(() => {
      function ComponentToRender() {
        return 'hey'
      }
      setup(<ComponentToRender />)
    })

    it('renders the children', () => {
      expect(screen.getByText(/hey/)).toBeInTheDocument()
    })
  })

  describe('when the children component crashes', () => {
    let error

    beforeEach(() => {
      function ComponentToRender() {
        throw new Error('random')
      }
      try {
        setup(<ComponentToRender />)
      } catch (e) {
        error = e
      }
    })

    it('propagate the error as its not a network error', () => {
      expect(error.message).toBe('random')
    })
  })

  describe('when the child component has a 500 error', () => {
    beforeEach(() => {
      function ComponentToRender() {
        // eslint-disable-next-line no-throw-literal
        throw {
          status: 500,
        }
      }
      setup(<ComponentToRender />)
    })

    it('renders a Server error', () => {
      expect(screen.queryByText(/hey/)).not.toBeInTheDocument()
    })
  })

  describe('when the child component crashes with a catch component set', () => {
    beforeEach(() => {
      function ComponentToRender() {
        // eslint-disable-next-line no-throw-literal
        throw {
          status: 500,
        }
      }
      setup(<ComponentToRender />, { fallback: 'I caught' })
    })

    it('renders a Server error', () => {
      expect(screen.queryByText(/hey/)).not.toBeInTheDocument()
    })

    it('renders a replacement ui', () => {
      expect(screen.getByText(/I caught/)).toBeInTheDocument()
    })
  })
})
