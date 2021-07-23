import CopyClipboard from './CopyClipboard'
import { render, screen } from 'custom-testing-library'
import userEvent from '@testing-library/user-event'

describe('CopyClipboard', () => {
  function setup() {
    render(<CopyClipboard string="to be copied" />)
  }

  describe('copies to clipboard', () => {
    beforeEach(() => {
      setup()
    })
    it('renders body', () => {
      const copyElements = screen.getByText('copy', { exact: true })
      expect(copyElements).toBeInTheDocument()
      window.prompt = jest.fn()
      userEvent.click(copyElements)
      expect(window.prompt).toHaveBeenCalled()
    })
  })
})
