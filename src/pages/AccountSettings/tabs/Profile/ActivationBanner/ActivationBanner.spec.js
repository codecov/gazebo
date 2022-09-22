import { render, screen } from '@testing-library/react'

import ActivationBanner from './ActivationBanner'

describe('ActivationBanner', () => {
  describe('rendering component', () => {
    it('renders header', async () => {
      render(<ActivationBanner />)

      const heading = await screen.findByText('Activation Status')
      expect(heading).toBeInTheDocument()
    })
    it('renders content', async () => {
      render(<ActivationBanner />)

      const content = await screen.findByText('You are currently not activated')
      expect(content).toBeInTheDocument()
    })
  })
})
