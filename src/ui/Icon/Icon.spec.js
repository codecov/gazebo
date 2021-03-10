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

  describe('renders small icon',  () => {
      beforeEach(() => {
          setup({name: 'check', size: 'sm'})
      })
      it('renders small icon', ()  => {
          const style = window.getComputedStyle(wrapper.container.querySelector('svg'))
          expect(style.width).toBe('12px')
          expect(style.height).toBe('12px')
      })
  })

  describe('renders medium icon',  () => {
    beforeEach(() => {
        setup({name: 'check'})
    })
    it('renders small icon', ()  => {
        const style = window.getComputedStyle(wrapper.container.querySelector('svg'))
        expect(style.width).toBe('24px')
        expect(style.height).toBe('24px')
    })
  })

  describe('renders larg icon',  () => {
    beforeEach(() => {
        setup({name: 'check', size: 'lg'})
    })
    it('renders small icon', ()  => {
        const style = window.getComputedStyle(wrapper.container.querySelector('svg'))
        expect(style.width).toBe('64px')
        expect(style.height).toBe('64px')
    })
  })

})
