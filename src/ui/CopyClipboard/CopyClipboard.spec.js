import CopyClipboard from './CopyClipboard'
import { render, screen } from 'custom-testing-library'
import userEvent from '@testing-library/user-event'
import { act } from '@testing-library/react'

jest.mock('copy-to-clipboard', () => () => true)

describe('CopyClipboard', () => {
  function setup() {
    render(<CopyClipboard string="to be copied" />)
  }

  describe('copies to clipboard', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      setup()
    })

    it('renders body', () => {
      let clipboard = screen.getByText(/clipboard-copy/, { exact: true })
      expect(clipboard).toBeInTheDocument()
      const button = screen.getByRole('button', {
        name: /copy/i,
      })
      window.prompt = jest.fn()
      userEvent.click(button)
      const success = screen.getByText(/check/, { exact: true })
      expect(success).toBeInTheDocument()
      act(() => {
        jest.runAllTimers()
      })
      clipboard = screen.getByText(/clipboard-copy/, { exact: true })
      expect(clipboard).toBeInTheDocument()
    })
  })
})
