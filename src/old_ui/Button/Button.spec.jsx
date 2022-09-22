import { fireEvent, render } from '@testing-library/react'

import Button from '.'

describe('Button', () => {
  let wrapper

  const onClick = jest.fn()

  describe('when rendered', () => {
    beforeEach(() => {
      wrapper = render(<Button onClick={onClick}>Click me</Button>)
    })

    it('renders a button', () => {
      expect(wrapper.container.querySelector('button')).not.toBeNull()
    })

    describe('when clicking', () => {
      beforeEach(() => {
        fireEvent.click(wrapper.getByText('Click me'))
      })

      it('calls the handler', () => {
        expect(onClick).toHaveBeenCalled()
      })
    })
  })
})
