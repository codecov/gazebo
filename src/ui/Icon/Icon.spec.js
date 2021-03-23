import { render } from '@testing-library/react'

import Icon from './Icon'

describe('Icon', () => {
  let wrapper

  const defaultProps = {
    name: 'search',
  }

  function setup(over = {}) {
    const props = {
      ...defaultProps,
      ...over,
    }
    wrapper = render(<Icon {...props} />)
  }

  describe('when rendered with a SVG we have', () => {
    beforeEach(setup)

    it('renders a svg', () => {
      expect(wrapper.container.querySelector('svg')).not.toBeNull()
    })
  })

  describe('when rendered with a SVG we dont have', () => {
    beforeEach(() => {
      setup({ name: 'icon-we-dont-have ' })
    })

    it('renders a svg', () => {
      expect(wrapper.container.querySelector('svg')).toBeNull()
    })
  })

  describe('renders small icon', () => {
    beforeEach(() => {
      setup({ size: 'sm' })
    })
    it('renders small icon', () => {
      const svg = wrapper.container.querySelector('svg')
      expect(svg.classList.contains('w-4')).toBe(true)
      expect(svg.classList.contains('h-4')).toBe(true)
    })
  })

  describe('renders medium icon', () => {
    beforeEach(setup)

    it('renders small icon', () => {
      const svg = wrapper.container.querySelector('svg')
      expect(svg.classList.contains('w-6')).toBe(true)
      expect(svg.classList.contains('h-6')).toBe(true)
    })
  })

  describe('renders large icon', () => {
    beforeEach(() => {
      setup({ size: 'lg' })
    })
    it('renders small icon', () => {
      const svg = wrapper.container.querySelector('svg')
      expect(svg.classList.contains('w-16')).toBe(true)
      expect(svg.classList.contains('h-16')).toBe(true)
    })
  })
})
