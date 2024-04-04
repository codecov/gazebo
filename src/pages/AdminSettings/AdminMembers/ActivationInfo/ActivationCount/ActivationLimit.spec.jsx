import { render, screen } from '@testing-library/react'

import ActivationLimit from './ActivationLimit'

describe('ActivationCount', () => {
  function setup() {
    render(<ActivationLimit />)
  }

  describe('it renders component', () => {
    beforeEach(() => {
      setup()
    })

    it('displays info message', async () => {
      const link = await screen.findByText('sales@codecov.io')

      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', 'mailto:sales@codecov.io')
    })
  })
})
