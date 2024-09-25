import { render, screen } from '@testing-library/react'

import Banner from './Banner'

describe('Banner', () => {
  describe('when rendered', () => {
    it('renders contents', () => {
      render(
        <Banner variant="default">
          <span>This is some content</span>
        </Banner>
      )

      const content = screen.getByText(/This is some content/)
      expect(content).toBeInTheDocument()
    })
  })
})
