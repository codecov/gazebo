import { render } from '@testing-library/react'
import LogoSpinner from '.'

describe('LogoSpinner', () => {
  let wrapper

  describe('when rendered', () => {
    beforeEach(() => {
      wrapper = render(<LogoSpinner />)
    })

    it('has a default size of 100px', () => {
      expect(wrapper.getByTestId('logo-spinner')).toHaveStyle({
        height: '100px',
      })
    })
  })

  describe('when giving a different size', () => {
    beforeEach(() => {
      wrapper = render(<LogoSpinner size={33} />)
    })

    it('has a size of 33px', () => {
      expect(wrapper.getByTestId('logo-spinner')).toHaveStyle({
        height: '33px',
      })
    })
  })
})
