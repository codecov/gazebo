import { render, screen } from '@testing-library/react'

import CriticalFile from './CriticalFileLabel'

describe('CriticalFile', () => {
  describe('when rendered', () => {
    // Wasn't able to find a better way to test this atm
    it('displays the correct text', () => {
      render(<CriticalFile />)

      const text = screen.getByText(/this is a/i)
      expect(text).toBeInTheDocument()

      const criticalFile = screen.getByText(/critical file/i)
      expect(criticalFile).toBeInTheDocument()

      const content = screen.getByText(
        /, which contains lines commonly executed in production/i
      )
      expect(content).toBeInTheDocument()

      const learnMore = screen.getByText(/learn more/i)
      expect(learnMore).toBeInTheDocument()
    })

    it('links to docs page', () => {
      render(<CriticalFile />)

      expect(screen.getByRole('link')).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/runtime-insights'
      )
    })
  })
})
