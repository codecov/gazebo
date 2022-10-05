import { render, screen } from '@testing-library/react'

import CIStatus from '.'

describe('CIStatus', () => {
  function setup(props) {
    render(<CIStatus {...props} />)
  }

  describe('when rendered', () => {
    it('shows ci passed', () => {
      setup({ ciPassed: true })
      expect(screen.getByText(/Passed/)).toBeInTheDocument()
    })

    it('shows ci failed', () => {
      setup({ ciPassed: false })
      expect(screen.getByText(/Failed/)).toBeInTheDocument()
    })

    it('shows ci failed if no status is given', () => {
      setup({})
      expect(screen.getByText(/Failed/)).toBeInTheDocument()
    })
  })
})
