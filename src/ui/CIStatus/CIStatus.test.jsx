import { render, screen } from '@testing-library/react'

import CIStatus from '.'

describe('CIStatus', () => {
  describe('when rendered', () => {
    it('shows ci passed', () => {
      render(<CIStatus ciPassed={true} />)

      const passed = screen.getByText(/Passed/)
      expect(passed).toBeInTheDocument()
    })

    it('shows ci failed', () => {
      render(<CIStatus ciPassed={false} />)

      const failed = screen.getByText(/Failed/)
      expect(failed).toBeInTheDocument()
    })

    it('shows no status if no status is given', () => {
      render(<CIStatus ciPassed={undefined} />)

      const noStatus = screen.getByText(/No Status/)
      expect(noStatus).toBeInTheDocument()
    })
  })
})
