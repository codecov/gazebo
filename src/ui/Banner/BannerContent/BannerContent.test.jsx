import { render, screen } from '@testing-library/react'

import BannerContent from './BannerContent'

describe('BannerContent', () => {
  describe('using regular content', () => {
    it('renders title title', () => {
      render(
        <BannerContent>
          <div>
            <span>Woa!</span>
          </div>
        </BannerContent>
      )

      const content = screen.getByText(/Woa!/)
      expect(content).toBeInTheDocument()
    })
  })
})
