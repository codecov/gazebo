import { render, screen } from '@testing-library/react'

import Icon from './Icon'

describe('Icon', () => {
  describe('when rendered with a SVG we have', () => {
    it('renders a svg', () => {
      render(<Icon name="check" />)

      const icon = screen.getByTestId('check-svg')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('when rendered with a SVG we dont have', () => {
    it('renders a svg', async () => {
      render(<Icon name="icon-we-dont-have" />)

      const icon = screen.queryByTestId('icon-we-dont-have-svg')
      expect(icon).not.toBeInTheDocument()
    })
  })

  describe('renders small icon', () => {
    it('renders small icon', async () => {
      render(<Icon name="check" size="sm" />)

      const icon = screen.getByTestId('check-svg')
      expect(icon).toHaveClass('w-3')
      expect(icon).toHaveClass('h-3')
    })
  })

  describe('renders medium icon', () => {
    it('renders small icon', async () => {
      render(<Icon name="check" />)

      const icon = screen.getByTestId('check-svg')
      expect(icon).toHaveClass('w-6')
      expect(icon).toHaveClass('h-6')
    })
  })

  describe('renders large icon', () => {
    it('renders small icon', async () => {
      render(<Icon name="check" size="lg" />)

      const icon = screen.getByTestId('check-svg')
      expect(icon).toHaveClass('w-16')
      expect(icon).toHaveClass('h-16')
    })
  })

  describe('renders custom size icon', () => {
    it('renders small icon', async () => {
      render(<Icon name="check" size="lg" iconClass="w-1 h-1" />)

      const icon = screen.getByTestId('check-svg')
      expect(icon).toHaveClass('w-1')
      expect(icon).toHaveClass('h-1')
    })
  })
})
