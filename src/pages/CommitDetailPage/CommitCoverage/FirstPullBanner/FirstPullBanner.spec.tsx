import { render, screen } from '@testing-library/react'

import FirstPullBanner from './FirstPullBanner'

describe('FirstPullBanner', () => {
  describe('When render with first pull request result', () => {
    it('should render heading', async () => {
      render(<FirstPullBanner />)

      const header = await screen.findByRole('heading', {
        name: /Welcome to Codecov/,
      })
      expect(header).toBeInTheDocument()
    })

    it('should render content', async () => {
      render(<FirstPullBanner />)

      const content = await screen.findByText(
        /Once merged to your default branch/
      )
      expect(content).toBeInTheDocument()
    })
  })
})
