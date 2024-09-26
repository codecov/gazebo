import { render, screen } from '@testing-library/react'

import Icon from './Icon'

describe('Icon', () => {
  describe('when rendered with a SVG we have', () => {
    it('renders a svg', () => {
      const { container } = render(<Icon name="search" />)
      expect(container).not.toBeEmptyDOMElement()
    })
  })

  describe("when rendered with a SVG we don't have", () => {
    it('renders nothing', () => {
      // @ts-expect-error
      const { container } = render(<Icon name="icon-we-dont-have" />)

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('renders small icon', () => {
    it('renders small icon', () => {
      render(<Icon name="search" size="sm" label="id-for-tests" />)
      const svgElement = screen.getByTestId('id-for-tests')

      expect(svgElement).toHaveClass('w-4')
      expect(svgElement).toHaveClass('h-4')
    })
  })

  describe('renders medium icon', () => {
    it('renders small icon', () => {
      render(<Icon name="search" label="id-for-tests" />)
      const svgElement = screen.getByTestId('id-for-tests')

      expect(svgElement).toHaveClass('w-6')
      expect(svgElement).toHaveClass('h-6')
    })
  })

  describe('renders large icon', () => {
    it('renders small icon', () => {
      render(<Icon name="search" size="lg" label="id-for-tests" />)
      const svgElement = screen.getByTestId('id-for-tests')

      expect(svgElement).toHaveClass('w-16')
      expect(svgElement).toHaveClass('h-16')
    })
  })
})
