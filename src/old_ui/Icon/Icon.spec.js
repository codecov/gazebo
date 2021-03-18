import { render } from '@testing-library/react'

import Icon from './Icon'

describe('Icon', () => {
  let wrapper

  function setup(props) {
    wrapper = render(<Icon {...props} />)
  }

  describe('when rendered with a SVG we have', () => {
    beforeEach(() => {
      setup({ name: 'check' })
    })

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
      setup({ name: 'check', size: 'sm' })
    })
    it('renders small icon', () => {
      const svg = wrapper.container.querySelector('svg')
      expect(svg.classList.contains('w-3')).toBe(true)
      expect(svg.classList.contains('h-3')).toBe(true)
    })
  })

  describe('renders medium icon', () => {
    beforeEach(() => {
      setup({ name: 'check' })
    })
    it('renders small icon', () => {
      const svg = wrapper.container.querySelector('svg')
      expect(svg.classList.contains('w-6')).toBe(true)
      expect(svg.classList.contains('h-6')).toBe(true)
    })
  })

  describe('renders large icon', () => {
    beforeEach(() => {
      setup({ name: 'check', size: 'lg' })
    })
    it('renders small icon', () => {
      const svg = wrapper.container.querySelector('svg')
      expect(svg.classList.contains('w-16')).toBe(true)
      expect(svg.classList.contains('h-16')).toBe(true)
    })
  })

  describe('renders cusotm size icon', () => {
    beforeEach(() => {
      setup({ name: 'check', size: 'lg', iconClass: 'w-1 h-1' })
    })
    it('renders small icon', () => {
      const svg = wrapper.container.querySelector('svg')
      expect(svg.classList.contains('w-1')).toBe(true)
      expect(svg.classList.contains('h-1')).toBe(true)
    })
  })
})
