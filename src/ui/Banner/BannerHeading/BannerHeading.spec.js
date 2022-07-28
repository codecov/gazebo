import { render, screen } from 'custom-testing-library'

import BannerHeading from './BannerHeading'

describe('BannerHeading', () => {
  function setup(content) {
    render(<BannerHeading>{content}</BannerHeading>)
  }

  describe('using regular content', () => {
    beforeEach(() => {
      const content = <h1>sample header!</h1>
      setup(content)
    })

    it('renders title title', () => {
      expect(screen.getByText(/sample header!/)).toBeInTheDocument()
    })
  })
})
