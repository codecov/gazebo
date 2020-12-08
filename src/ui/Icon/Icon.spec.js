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
})
