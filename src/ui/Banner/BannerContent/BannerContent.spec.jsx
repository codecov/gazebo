import { render, screen } from 'custom-testing-library'

import BannerContent from './BannerContent'

describe('BannerContent', () => {
  function setup(content) {
    render(<BannerContent>{content}</BannerContent>)
  }

  describe('using regular content', () => {
    beforeEach(() => {
      const content = (
        <div>
          <span>Woa!</span>
        </div>
      )
      setup(content)
    })

    it('renders title title', () => {
      expect(screen.getByText(/Woa!/)).toBeInTheDocument()
    })
  })
})
