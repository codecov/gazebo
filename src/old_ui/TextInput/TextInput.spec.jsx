import { render, screen } from '@testing-library/react'

import TextInput from './TextInput'

describe('TextInput', () => {
  function setup(props) {
    render(
      <>
        <label htmlFor="text-input">label</label>
        <TextInput id="text-input" {...props} />
      </>
    )
  }

  describe('when rendered', () => {
    it('renders the textbox with the name of the label', () => {
      setup()
      const label = screen.getByRole('textbox', {
        name: /label/i,
      })
      expect(label).toBeInTheDocument()
    })
  })

  describe('renders embedded content', () => {
    it('renders the textbox with the name of the label', () => {
      setup({ embedded: () => 'hello' })
      const textbook = screen.getByRole('textbox', {
        name: /label/i,
      })
      expect(textbook).toBeInTheDocument()
    })

    it('renders embedded content', () => {
      setup({ embedded: () => 'hello' })
      expect(screen.getByText(/hello/)).toBeInTheDocument()
    })
  })
})
