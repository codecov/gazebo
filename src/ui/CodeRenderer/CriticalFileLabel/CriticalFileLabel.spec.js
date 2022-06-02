import { render, screen } from '@testing-library/react'

import CriticalFile from '.'

describe('CriticalFile', () => {
  function setup() {
    render(<CriticalFile />)
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })

    // Wasn't able to find a better way to test this atm
    it('displays the correct text', () => {
      expect(screen.getByText(/this is a/i)).toBeInTheDocument()
      expect(screen.getByText(/critical file/i)).toBeInTheDocument()
      expect(
        screen.getByText(
          /, which contains lines commonly executed in production/i
        )
      ).toBeInTheDocument()
      expect(screen.getByText(/learn more/i)).toBeInTheDocument()
    })

    it('links to docs page', () => {
      expect(screen.getByRole('link')).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/runtime-insights'
      )
    })
  })
})
