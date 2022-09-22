import { render, screen } from '@testing-library/react'

import MissingMemberBanner from './MissingMemberBanner'

describe('MissingMemberBanner', () => {
  function setup() {
    render(<MissingMemberBanner />)
  }

  describe('shows expected items', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the title', () => {
      expect(screen.getByText(/Don’t see a member?/)).toBeInTheDocument()
    })

    it('renders the body', () => {
      expect(
        screen.getByText(
          /It may be because they haven’t logged into Codecov yet. Please make sure they log into Codecov first/
        )
      ).toBeInTheDocument()
    })
  })
})
