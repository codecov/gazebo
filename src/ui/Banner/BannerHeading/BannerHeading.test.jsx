import { render, screen } from '@testing-library/react'

import BannerHeading from './BannerHeading'

describe('BannerHeading', () => {
  describe('using regular content', () => {
    it('renders title title', () => {
      render(
        <BannerHeading>
          {' '}
          <h1>sample header!</h1>
        </BannerHeading>
      )

      const heading = screen.getByText(/sample header!/)
      expect(heading).toBeInTheDocument()
    })
  })
})
