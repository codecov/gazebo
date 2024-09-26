import { render, screen } from '@testing-library/react'

import Badge from './Badge'

describe('Badge', () => {
  describe('default', () => {
    it('should render a default badge', () => {
      render(<Badge>Badge</Badge>)

      const badge = screen.getByText('Badge')
      expect(badge).toHaveClass('bg-ds-pink-default text-white')
    })
  })
})
