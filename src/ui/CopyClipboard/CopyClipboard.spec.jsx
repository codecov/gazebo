import { render, screen } from 'custom-testing-library'

import { act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import CopyClipboard from './CopyClipboard'

jest.mock('copy-to-clipboard', () => () => true)

beforeEach(() => {
  jest.useFakeTimers()
  window.prompt = jest.fn()
})

describe('CopyClipboard', () => {
  function setup() {
    render(<CopyClipboard string="to be copied" />)
  }

  describe('when the component is mounted', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the button with clipboard icon', () => {
      const clipboard = screen.getByText(/clipboard-copy/, { exact: true })
      expect(clipboard).toBeInTheDocument()
    })
  })

  describe('when the user clicks on the button to copy', () => {
    beforeEach(() => {
      setup()
      const button = screen.getByRole('button', {
        name: /copy/i,
      })
      userEvent.click(button)
    })

    it('renders the success icon', () => {
      const success = screen.getByText(/check/, { exact: true })
      expect(success).toBeInTheDocument()
    })

    describe('when 1 seconds elapsed', () => {
      beforeEach(() => {
        act(() => {
          jest.advanceTimersByTime(1000)
        })
      })

      it('still render the success icon', () => {
        const success = screen.getByText(/check/, { exact: true })
        expect(success).toBeInTheDocument()
      })
    })

    describe('when 2 seconds elapsed', () => {
      beforeEach(() => {
        act(() => {
          jest.advanceTimersByTime(2000)
        })
      })

      it('goes back to original state', () => {
        const clipboard = screen.getByText(/clipboard-copy/, { exact: true })
        expect(clipboard).toBeInTheDocument()
      })
    })
  })
})
