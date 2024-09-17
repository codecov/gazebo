import { render, screen } from '@testing-library/react'

import ActivationLimit from './ActivationLimit'

describe('ActivationCount', () => {
  describe('it renders component', () => {
    it('displays info message', async () => {
      render(<ActivationLimit />)
      const link = await screen.findByText('sales@codecov.io')

      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', 'mailto:sales@codecov.io')
    })
  })
})
