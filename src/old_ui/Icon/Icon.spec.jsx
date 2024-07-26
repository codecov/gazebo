import { render, screen } from '@testing-library/react'

import Icon from './Icon'

describe('Icon', () => {
  function setup(props) {
    render(<Icon {...props} />)
  }

  describe('when rendered with a SVG we have', () => {
    beforeEach(() => {
      setup({ name: 'check' })
    })

    it('renders a svg', () => {
      const icon = screen.queryByText('check.svg')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('when rendered with a SVG we dont have', () => {
    beforeEach(() => {
      setup({ name: 'icon-we-dont-have' })
    })

    it('renders a svg', async () => {
      const icon = screen.queryByText('icon-we-dont-have.svg')
      expect(icon).not.toBeInTheDocument()
    })
  })

  describe('renders small icon', () => {
    beforeEach(() => {
      setup({ name: 'check', size: 'sm' })
    })
    it('renders small icon', async () => {
      const icon = await screen.findByText('check.svg')
      expect(icon).toHaveClass('w-3')
      expect(icon).toHaveClass('h-3')
    })
  })

  describe('renders medium icon', () => {
    beforeEach(() => {
      setup({ name: 'check' })
    })
    it('renders small icon', async () => {
      const icon = await screen.findByText('check.svg')
      expect(icon).toHaveClass('w-6')
      expect(icon).toHaveClass('h-6')
    })
  })

  describe('renders large icon', () => {
    beforeEach(() => {
      setup({ name: 'check', size: 'lg' })
    })
    it('renders small icon', async () => {
      const icon = await screen.findByText('check.svg')
      expect(icon).toHaveClass('w-16')
      expect(icon).toHaveClass('h-16')
    })
  })

  describe('renders custom size icon', () => {
    beforeEach(() => {
      setup({ name: 'check', size: 'lg', iconClass: 'w-1 h-1' })
    })
    it('renders small icon', async () => {
      const icon = await screen.findByText('check.svg')
      expect(icon).toHaveClass('w-1')
      expect(icon).toHaveClass('h-1')
    })
  })
})
