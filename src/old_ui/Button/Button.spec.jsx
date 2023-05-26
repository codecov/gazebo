import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Button from '.'

describe('Button', () => {
  const onClick = jest.fn()

  describe('when rendered', () => {
    function setup() {
      const user = userEvent.setup()
      return { user }
    }

    it('renders a button', () => {
      render(<Button onClick={onClick}>Click me</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    describe('when clicking', () => {
      it('calls the handler', async () => {
        const { user } = setup()
        render(<Button onClick={onClick}>Click me</Button>)

        const button = screen.getByRole('button')
        await user.click(button)

        expect(onClick).toHaveBeenCalled()
      })
    })
  })
})
