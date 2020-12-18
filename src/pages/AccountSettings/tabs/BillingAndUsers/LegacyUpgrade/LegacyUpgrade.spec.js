import { render, screen } from '@testing-library/react'
import LegacyUpgrade from './LegacyUpgrade'

describe('LegacyUpgrade', () => {
  function setup() {
    render(<LegacyUpgrade />)
  }

  describe('Renders the page', () => {
    beforeEach(() => {
      setup()
    })

    it('Shows upgrade message', () => {
      const messageTitle =
        'You are using a Legacy Plan Your current plan is part of our legacy per repository billing subscription.'
      const tab = screen.getByText(messageTitle)
      expect(tab).toBeInTheDocument()
    })
  })
})
