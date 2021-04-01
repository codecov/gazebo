import { render, screen } from '@testing-library/react'

import Avatar from './Avatar'

describe('Avatar', () => {
  describe('Renders users avatar', () => {
    it('renders image', () => {
      render(<Avatar username={'test'} avatarUrl={'https://image'} />)
      const img = screen.getByRole('img')
      expect(img).toBeInTheDocument()
    })
  })

  describe('Renders default image', () => {
    it('renders BB default image', () => {
      render(<Avatar username={'test'} avatarUrl={null} />)
      const svg = screen.getByTestId('bb-avatar')
      expect(svg).toBeInTheDocument()
    })
  })
})
