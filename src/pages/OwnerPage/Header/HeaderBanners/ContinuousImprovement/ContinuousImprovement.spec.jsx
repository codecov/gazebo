import { render, screen } from '@testing-library/react'

import ContinuousImprovement from './ContinuousImprovement'

describe('ContinuousImprovement', () => {
  describe('rendering banner', () => {
    it('has header content', () => {
      render(<ContinuousImprovement provider="gh" />)

      const header = screen.getByText('Updating our web app')
      expect(header).toBeInTheDocument()
    })

    it('has body content', () => {
      render(<ContinuousImprovement provider="gh" />)

      const body = screen.getByText(/We've been making changes/)
      expect(body).toBeInTheDocument()
    })

    it('has link to feedback', () => {
      render(<ContinuousImprovement provider="gh" />)

      const link = screen.getByRole('link', { name: /this issue/ })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute(
        'href',
        'https://github.com/codecov/Codecov-user-feedback/issues/1'
      )
    })
  })
})
